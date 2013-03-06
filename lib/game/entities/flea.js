ig.module(
	'game.entities.flea'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityFlea = ig.Entity.extend({
    checkAgainst: ig.Entity.TYPE.NONE,
    size: {x: 30, y: 30},
    gravityFactor: 0,
    zIndex: 2,
    visible: false,

    // Timers
    lifeTime: 60,
    popupTime: 15, // How often a flea pops up
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
    
    animSheet: new ig.AnimationSheet( 'media/otherflea.png', 30, 30 ),

	init: function(x, y, settings) {
        this.anims.idle = new ig.Animation( this.animSheet, 0, [0], true );
        this.parent(x, y, settings);
        if( !ig.global.wm ) {
            //
        }

        if (this.kind === 'male') {
        //    this.visible = true;
            ig.game.controller.totalFleas.male++; // Increase total male flea count
            this.visibilityDuration = ig.game.controller.randomFromTo(5,30);
            this.visibilityDurationTimer = new ig.Timer(this.visibleDuration);
            this.visibilityDurationTimer.pause();
            this.popupTime = ig.game.controller.randomFromTo(15,30);
            this.popupTimer = new ig.Timer(this.popupTime);
        }
        else if (this.kind === 'female') {
            ig.game.controller.totalFleas.female--; // Increase total female flea count
        }
        this.currentAnim = this.anims.idle;
    },
	
    update: function() {
        if (this.kind === 'male') {
            if (this.vel.x < 2 && this.vel.y < 2) {
                this.pickMovementTarget();
            }
            if (!this.visible) {
                this.moveFlea();
            }

            if (this.popupTimer.delta() > 0 && !this.visible) {
                this.visible = true;
                this.angle = ig.game.controller.randomFromTo(0,360);
                var newTime = ig.game.controller.randomFromTo(15,30);
                this.popupTimer.set(newTime);
                this.popupTimer.pause();
                this.visibilityDurationTimer.unpause();
            }

            if (this.visibilityDurationTimer.delta() > 0 && this.visible) {
                this.visible = false;
                var newTime = ig.game.controller.randomFromTo(5,30);
                this.visibilityDurationTimer.set(newTime);
                this.visibilityDurationTimer.pause();
                this.popupTimer.unpause();
            }
        }
        if (this.visible) {
            this.detected = ig.game.controller.checkDetection(this);
            if (this.detected) {
                this.kill();
            }
        }
        this.currentAnim.angle = this.angle.toRad();

        this.parent();
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
});