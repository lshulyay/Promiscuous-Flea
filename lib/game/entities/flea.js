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
    lifeTime: 60,
    minPopupTime: 1,
    maxPopupTime: 50,
    popupTime: null, // How often a flea pops up

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
        ig.game.pool.addToPool(this,ig.game.pool.allEntitiesArr);
        this.inUse = false;
        
     //   this.initialize();
    },
	
    initialize: function() {
        // Set random position

        this.visibilityDuration = ig.game.controller.randomFromTo(5,30);
        this.visibilityDurationTimer = new ig.Timer(this.visibleDuration);
        this.visibilityDurationTimer.pause();

        // Start lifespan timer
        this.lifespanTimer = new ig.Timer(this.lifeTime);
        if (this.kind === 'male') {
            this.fertility = 1;
            ig.game.controller.totalFleas.male++; // Increase total male flea count
            this.anims.idle = new ig.Animation( this.maleAnimSheet, 0.1, [0,1,2,1,0,3,4,3] );
            this.anims.digging = new ig.Animation( this.maleAnimSheet, 0.02, [6,7,8,9,10,11,12,13,14,15,16,17], true );
            if (!this.popupTime) {
                this.popupTime = ig.game.controller.randomFromTo(this.minPopupTime,this.maxPopupTime);
                this.popupTimer = new ig.Timer(this.popupTime);
            }
            if (ig.game.getEntitiesByType(EntityFlea).length < 1) {
                this.visibilityDurationTimer.set(3);
                this.revealFlea();
            }
        }
        else if (this.kind === 'female') {
            ig.game.controller.totalFleas.female++; // Increase total female flea count
            this.anims.idle = new ig.Animation( this.femaleAnimSheet, 0.1, [0,1,2,1,0,3,4,3] );
            this.anims.digging = new ig.Animation( this.femaleAnimSheet, 0.02, [6,7,8,9,10,11,12,13,14,15,16,17], true );
        }
        this.currentAnim = this.anims.idle;
        if (this.justBorn) {
            ig.game.controller.calcScore(1);
            this.visibilityDurationTimer.set(1);
            this.revealFlea();
        }
        else {
            this.pos = ig.game.controller.setRandomLocation(true);
        }
    },

    update: function() {
        if (this.inUse === true) {
            if (this.kind === 'male') {
                if (this.vel.x < 2 && this.vel.y < 2) {
                    this.pickMovementTarget();
                }

                this.visibilityChecks();

                if (this.popupTimer.delta() > 0 && !this.visible) {
                    this.revealFlea();
                }

                if (this.visibilityDurationTimer.delta() > 0 && this.visible && this.currentAnim === this.anims.idle) {
                //    this.hideFlea();
                //    this.currentAnim.loopCount = 0;
                this.hideFlea(false);            
                //    console.log('pos x old: ' + this.pos.x + ' pos y old: ' + this.pos.y);
                //    console.log('pos x new: ' + this.pos.x + ' pos y new: ' + this.pos.y);
                }
            }
            else if (this.justBorn && this.kind === 'female') {
                this.visibilityChecks();
                if (this.visibilityDurationTimer.delta() > 0 && this.visible && this.currentAnim === this.anims.idle) {
                //    this.hideFlea();
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
        if (this.popupTimer) {
            var newTime = ig.game.controller.randomFromTo(this.minPopupTime,this.maxPopupTime);
            this.popupTimer.set(newTime);
            this.popupTimer.pause();
        }
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
            if (this.popupTimer) {
                this.popupTimer.unpause();
            }
        }
    },

    visibilityChecks: function() {
        if (!this.visible) {
        //    this.moveFlea();
        }

        else { 
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

    pickMovementTarget: function() {
        this.movementTarget.x = ig.game.controller.randomFromTo(15, 425);
        this.movementTarget.y = ig.game.controller.randomFromTo(13, 370);
    },

    moveFlea: function() {
        var r = Math.atan2(this.movementTarget.y-this.pos.y, this.movementTarget.x-this.pos.x);
        var vely = Math.sin(r) * this.speed;
        var velx =  Math.cos(r) * this.speed;
        this.vel.x = velx;
        this.vel.y = vely;

    },

    destroy: function() {
        if (this.kind === 'male') {
            ig.game.controller.totalFleas.male--;
        }
        else if (this.kind === 'female') {
            ig.game.controller.totalFleas.female--;
        }
        var rand = ig.game.controller.randomFromTo(0,ig.game.deathSoundsArr.length - 1);
        var deathSound = ig.game.deathSoundsArr[rand];
        deathSound.play();
        this.justBorn = false;
        this.kind = null;
        ig.game.pool.removeEntity(this);
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
        if( !ig.global.wm ) {
            //
        }
        var rand = ig.game.controller.randomFromTo(0,2);
        if (rand < 2) {
            this.color = this.blue;
            this.kind = 'male';
        }
        else {
            this.color = this.red;
            this.kind = 'female';
        }
        this.hatchTimer = new ig.Timer(5);
    },
    
    update: function() {
        if (this.hatchTimer.delta() > 0) {
            ig.game.pool.useObject('flea', {kind: this.kind, justBorn: true, pos:{x: this.pos.x, y: this.pos.y}});
            this.kill();
        }
        this.parent();
    },


    kill: function() {
        // Spawn flea entity here
        this.parent();
    },

    draw: function() {
        ig.game.ctx.beginPath();
        ig.game.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
        ig.game.ctx.fillStyle = 'rgba(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ',' + this.alpha + ')';
        ig.game.ctx.fill();
        this.parent();
    }

});
});