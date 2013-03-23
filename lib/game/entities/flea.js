ig.module(
	'game.entities.flea'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityFlea = ig.Entity.extend({
    type: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.NEVER,
    checkAgainst: ig.Entity.TYPE.NONE,

    inUse: false,

    size: {x: 31, y: 31},
    gravityFactor: 0,
    zIndex: 2,
    visible: false,

    // Timers
    lifeTime: null,
    minPopupTime: 15,
    maxPopupTime: 50,
    popupTime: null, // How often a flea pops up
    lastStandTaken: false,

    minVisibleDuration: 10,
    maxVisibleDuration: 30,
    visibleDuration: 15, // How long a flea stays visible

    detected: false,
    justBorn: false,
    bornRevealed: false,

    // Movement
    maxVel: {x: 150, y: 150},
    friction: {x: 500, y: 500},
    angle: 0.5,
    accelGround: 700,
    accelAir: 700,
    speed: 100,
    accelTurnSpeed: 3,
    movementTarget: {x: null, y: null},
    
    maleAnimSheet: new ig.AnimationSheet( 'media/otherflea.png', 31, 31 ),
    femaleAnimSheet: new ig.AnimationSheet( 'media/femaleotherflea.png', 31, 31 ),
	init: function(x, y, settings) {
        this.parent(x, y, settings);
        ig.game.pool.addToPool(this,ig.game.pool.allFleasArr);
        this.inUse = false;

        // Create all required timers
        this.lifespanTimer = new ig.Timer(null),
        this.popupTimer = new ig.Timer(null),
        this.visibilityDurationTimer = new ig.Timer(null),
        // Male animations
        this.anims.maleIdle = new ig.Animation( this.maleAnimSheet, 0.1, [0,1,2,1,0,3,4,3] );
        this.anims.maleIdleOld = new ig.Animation( this.maleAnimSheet, 0.1, [18,19,20,19,18,21,22,21]);
        this.anims.maleDigging = new ig.Animation( this.maleAnimSheet, 0.02, [6,7,8,9,10,11,12,13,14,15,16,17], true );

        // Female animations
        this.anims.femaleIdle = new ig.Animation( this.femaleAnimSheet, 0.1, [0,1,2,1,0,3,4,3] );
        this.anims.femaleDigging = new ig.Animation( this.femaleAnimSheet, 0.02, [6,7,8,9,10,11,12,13,14,15,16,17], true );
     //   this.initialize();
    },
	
    initialize: function() {
        // Set random position
        this.lifeTime = ig.game.controller.randomFromTo(ig.game.controller.minLifeTime,ig.game.controller.maxLifeTime);
        this.lifespanTimer.set(this.lifeTime);

        this.visibileDuration = ig.game.controller.randomFromTo(5,30);
        this.visibilityDurationTimer.set(this.visibleDuration);
        this.visibilityDurationTimer.pause();

        // Start lifespan timer
        if (this.kind === 'male') {
            this.fertility = 1;

            // Increase total male flea count
            ig.game.controller.totalFleas.male++;
            this.anims.idle = this.anims.maleIdle;
            this.anims.digging = this.anims.maleDigging;

            // Set timer for flea to pop up from cat fur
            this.popupTime = ig.game.controller.randomFromTo(1,10);
            this.popupTimer.set(this.popupTime);

            // Make first two fleas visible immediately at the start of level
            if (ig.game.controller.totalFleas.male < 3) {
                this.visibilityDurationTimer.set(5);
                this.revealFlea();
            } 
        }
        else if (this.kind === 'female') {
            // Increase total female flea count
            ig.game.controller.totalFleas.female++;
            this.anims.idle = this.anims.femaleIdle;
            this.anims.digging = this.anims.femaleDigging;
        }
        this.currentAnim = this.anims.idle;

        // If this is a newborn (player-birthed) flea...
        if (this.justBorn) {

            // Play birth sound
            ig.game.wheeSound.play();

            // Add 1 to score
            ig.game.controller.calcScore(1);

            // Make it visible for a very short amount of time
            this.visibilityDurationTimer.set(1);
            this.revealFlea();
        }

        // If this is not a newborn flea...
        else {
            // Set random position
            this.pos = ig.game.controller.setRandomLocation(true);
        }
    },

    update: function() {
        if (this.inUse === true) {

            // If flea is a male...
            if (this.kind === 'male') {
                // Check if it's visible
                this.visibilityChecks();
                if (this.popupTimer.delta() > 0 && !this.visible) {
                    this.revealFlea();
                }

                if (this.visibilityDurationTimer.delta() > 0 && this.visible && this.currentAnim === this.anims.idle) {
                    this.hideFlea(false);
                }

                if (this.lifespanTimer.delta() > -1 && !this.lastStandTaken) {
                    this.currentAnim = this.anims.maleIdleOld;
                    this.visibilityDurationTimer.set(3);
                    this.lastStandTaken = true;
                    this.revealFlea();
                }
            }
            else if (this.justBorn && this.kind === 'female') {
                this.visibilityChecks();
                if (this.visibilityDurationTimer.delta() > 0 && this.visible && this.currentAnim === this.anims.idle) {
                    this.hideFlea(false);
                    this.justBorn = false;
                }
            }

            // Kill if the lifespan has run out
            if (this.lifespanTimer.delta() > 0 && !this.visible) {
                // If flea about to die is female, she has a chance to mate once before death
                if (this.kind === 'female' && ig.game.controller.totalFleas.male > 0) {
                    var rand = ig.game.controller.randomFromTo(0,1);
                    if (rand === 0) {
                        // Choose if flea is to be male or female
                        var rand = ig.game.controller.randomFromTo(0,1);
                        var kind;
                        if (rand === 0) {
                            kind = 'female';
                        }
                        else {
                            kind = 'male';
                        }
                        var spawn = ig.game.controller.setRandomLocation(false);
                        ig.game.spawnEntity(EntityFlea, spawn.x, spawn.y, {kind: kind});
                        ig.game.spawnEntity(EntityNotification, 0, 0, {notification: '1 ' + kind + ' flea born!'});
                    }
                }
                ig.game.spawnEntity(EntityNotification, 0, 0, {notification: 'A ' + this.kind + ' flea died of old age!'});
                this.destroy();
            }

            if (this.currentAnim === this.anims.digging && this.currentAnim.loopCount) {
                this.hideFlea(true);
                this.currentAnim = this.anims.idle;
            }


            this.parent();
        }

    },

    revealFlea: function() {
        if (!this.justBorn) {
            this.pos = ig.game.controller.setRandomLocation(true);
        }
        this.visible = true;
        this.angle = ig.game.controller.randomFromTo(0,360);
        this.popupTime = ig.game.controller.randomFromTo(this.minPopupTime,this.maxPopupTime);
        this.popupTimer.set(this.popupTime);
        this.popupTimer.pause();
        this.visibilityDurationTimer.unpause();
    },

    hideFlea: function(digDone) {
        if (!digDone) {
            var tempAngle = this.currentAnim.angle;
            this.currentAnim = this.anims.digging.rewind();
            this.currentAnim.angle = tempAngle;
        }
        else {
            this.visible = false;
            this.fertility = 1; // Increase fertility for next pop-up.
            // Make sure the newly born flea can breed the next time it pops up.
            if (this.justBorn) {
                this.justBorn = false;
            }
            var newTime = ig.game.controller.randomFromTo(this.minVisibleDuration,this.maxVisibleDuration);
            this.visibilityDurationTimer.set(newTime);
            this.visibilityDurationTimer.pause();
            this.popupTimer.unpause();
        }
    },

    visibilityChecks: function() {
        if (this.visible) {
            var angleStep = 1;
            if (this.currentAnim.angle.toDeg() > this.angle + 5) {
                this.currentAnim.angle -= angleStep.toRad();
            }

            else if (this.currentAnim.angle.toDeg() < this.angle - 5) {
                this.currentAnim.angle += angleStep.toRad();
            }

            else {
                this.angle = ig.game.controller.randomFromTo(0,360);
            }

            this.detected = ig.game.controller.checkDetection(this.pos.x,this.pos.y,this.size.x);
            if (this.detected) {
                ig.game.spawnEntity(EntityNotification, 0, 0, {notification: 'A ' + this.kind + ' flea was spotted and perished!'});
                this.destroy();
            }
        }
    },

    destroy: function() {
        var totalFleas = ig.game.controller.totalFleas;
        if (this.kind === 'male') {
            totalFleas.male--;
        }
        else if (this.kind === 'female') {
            totalFleas.female--;
        }
        var rand = ig.game.controller.randomFromTo(0,ig.game.deathSoundsArr.length - 1);
        var deathSound = ig.game.deathSoundsArr[rand];
        deathSound.play();
        this.justBorn = false;
        this.kind = null;
        ig.game.pool.removeEntity(this);
        if (totalFleas.male + totalFleas.female <= 1) {
            ig.game.loadLevel(LevelEnd);
        }

        else if (totalFleas.male === 0) {
            ig.Timer.timeScale = 2;
        }
    },

    draw: function() {
        if (this.inUse) {
            if (this.visible) {
                this.parent();
            }
        }
    }

});

ig.global.EntityBabyflea = ig.Entity.extend({
    type: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,
    checkAgainst: ig.Entity.TYPE.NONE,
    size: {x: 1, y: 1},
    gravityFactor: 0,
    zIndex: 2,
    visible: true,


    detected: false,

    alpha: 1,
    blue: {r: 0, g: 186, b: 255},
    red: {r: 255, g: 0, b: 0}, 
    color: null,
    radius: 5,

    init: function(x, y, settings) {
        this.parent(x, y, settings);
        ig.game.pool.addToPool(this,ig.game.pool.allEggsArr);
        this.inUse = false;
        this.hatchTimer = new ig.Timer(5);
    },

    initialize: function() {
        var rand = ig.game.controller.randomFromTo(0,2);
        if (rand < 2) {
            this.color = this.blue;
            this.kind = 'male';
        }
        else {
            this.color = this.red;
            this.kind = 'female';
        }
        this.hatchTimer.reset();
    },

    update: function() {
        if (this.inUse) {
            if (this.hatchTimer.delta() > 0) {
                ig.game.pool.useObject('flea', {kind: this.kind, justBorn: true, pos:{x: this.pos.x, y: this.pos.y}});
                this.destroy();
            }
            this.parent();
        }
    },


    destroy: function() {
        this.kind = null;
        ig.game.pool.removeEntity(this);
    },

    draw: function() {
        if (this.inUse) {
            ig.game.ctx.beginPath();
            ig.game.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
            ig.game.ctx.fillStyle = 'rgba(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ',' + this.alpha + ')';
            ig.game.ctx.fill();
            this.parent();
        }
    }

});
});