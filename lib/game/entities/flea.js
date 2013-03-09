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
    size: {x: 30, y: 30},
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

    // Movement
    maxVel: {x: 150, y: 150},
    friction: {x: 500, y: 500},
    angle: 0.5,
    accelGround: 700,
    accelAir: 700,
    speed: 100,
    accelTurnSpeed: 3,
    movementTarget: {x: null, y: null},
    
    maleAnimSheet: new ig.AnimationSheet( 'media/otherflea.png', 30, 30 ),
    femaleAnimSheet: new ig.AnimationSheet( 'media/femaleotherflea.png', 30, 30),
	init: function(x, y, settings) {
        this.parent(x, y, settings);
        if( !ig.global.wm ) {
            //
        }
        this.visibilityDuration = ig.game.controller.randomFromTo(5,30);
        this.visibilityDurationTimer = new ig.Timer(this.visibleDuration);
        this.visibilityDurationTimer.pause();
        if (this.kind === 'male') {
            ig.game.controller.totalFleas.male++; // Increase total male flea count
            this.anims.idle = new ig.Animation( this.maleAnimSheet, 0, [0], true );
            this.fertility = 1; // Set fertility level for male flea.
            if (!this.popupTime) {
                this.popupTime = ig.game.controller.randomFromTo(this.minPopupTime,this.maxPopupTime);
                this.popupTimer = new ig.Timer(this.popupTime);
            }
        }
        else if (this.kind === 'female') {
            ig.game.controller.totalFleas.female++; // Increase total female flea count
            this.anims.idle = new ig.Animation( this.femaleAnimSheet, 0, [0], true );
        }
        this.currentAnim = this.anims.idle;
        if (this.justBorn) {
            this.visibilityDurationTimer.set(3);
        //    this.visibilityDurationTimer.unpause();
            this.revealFlea();
        }
    },
	
    update: function() {
        if (this.kind === 'male') {
            if (this.vel.x < 2 && this.vel.y < 2) {
                this.pickMovementTarget();
            }

            this.visibilityChecks();

            if (this.popupTimer.delta() > 0 && !this.visible) {
                this.revealFlea();
            }

            if (this.visibilityDurationTimer.delta() > 0 && this.visible) {
                this.hideFlea();
            }
        }
        else if (this.justBorn && this.kind === 'female') {
            this.visibilityChecks();
            if (this.visibilityDurationTimer.delta() > 0 && this.visible) {
                this.hideFlea();
                this.justBorn = false;
            }
        }
        this.parent();
    },

    revealFlea: function() {
        this.visible = true;
        this.angle = ig.game.controller.randomFromTo(0,360);
        if (this.popupTimer) {
            var newTime = ig.game.controller.randomFromTo(this.minPopupTime,this.maxPopupTime);
            this.popupTimer.set(newTime);
            this.popupTimer.pause();
        }
        this.visibilityDurationTimer.unpause();
    },

    hideFlea: function() {
        this.visible = false;
        this.fertility = 1; // Increase fertility for next pop-up.
        var newTime = ig.game.controller.randomFromTo(this.minVisibleDuration,this.maxVisibleDuration);
        this.visibilityDurationTimer.set(newTime);
        this.visibilityDurationTimer.pause();
        this.popupTimer.unpause();    
    },

    visibilityChecks: function() {
        if (!this.visible) {
            this.moveFlea();
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

            this.detected = ig.game.controller.checkDetection(this);
            if (this.detected) {
                this.kill();
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

    kill: function() {
        if (this.kind === 'male') {
            ig.game.controller.totalFleas.male--;
        }
        else if (this.kind === 'female') {
            ig.game.controller.totalFleas.female--;
        }
        this.parent();
    },

    draw: function() {
        if (this.visible) {
            this.parent();
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

    
  //  animSheet: new ig.AnimationSheet( 'media/otherflea.png', 30, 30 ),

    init: function(x, y, settings) {
        this.parent(x, y, settings);
        if( !ig.global.wm ) {
            //
        }
        var rand = ig.game.controller.randomFromTo(0,1);
        if (rand === 0) {
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
            ig.game.spawnEntity(EntityFlea, this.pos.x, this.pos.y, {kind: this.kind, justBorn: true});
            this.kill();
        }
        this.parent();
    },


    moveFlea: function() {
        var r = Math.atan2(this.movementTarget.y-this.pos.y, this.movementTarget.x-this.pos.x);
        var vely = Math.sin(r) * this.speed;
        var velx =  Math.cos(r) * this.speed;
        this.vel.x = velx;
        this.vel.y = vely;
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