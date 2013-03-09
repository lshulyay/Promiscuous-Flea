ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityPlayer = ig.Entity.extend({
    type: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.NEVER,
    checkAgainst: ig.Entity.TYPE.B,
    size: {x: 30, y: 30},
    gravityFactor: 0,
    zIndex: 2,

    // Detection
    detected: false,

    // Babymaking
    pregnant: false,
    pregnancyTimer: new ig.Timer(5),

    // Movement
    maxVel: {x: 150, y: 150},
    friction: {x: 500, y: 500},
    angle: 0,
    accelGround: 700,
    accelAir: 700,
    speed: 200,
    accelTurnSpeed: 250,
    
    animSheet: new ig.AnimationSheet( 'media/player.png', 30, 30 ),

	init: function(x, y, settings) {
        this.anims.idle = new ig.Animation( this.animSheet, 0, [0], true );
        this.parent(x, y, settings);
        ig.game.player = this;
        this.pregnancyTimer.pause();
        if( !ig.global.wm ) {
            ig.game.controller.totalFleas.female++;
        }
        this.currentAnim = this.anims.idle;
    },
	
    update: function() {
        var accel = this.standing ? this.accelGround : this.accelAir;
        this.currentAnim.angle = this.angle.toRad();
        this.checkMovement();
        this.checkDetection();
        if (this.pregnant) {
            this.checkPregnancy();
        }
        this.parent();
    },

    checkMovement: function() {
        if (ig.input.state('right')) {
            this.angle += this.accelTurnSpeed * ig.system.tick;

        }
        
        else if (ig.input.state('left')) {
            this.angle -= this.accelTurnSpeed * ig.system.tick;
        }


        if (ig.input.state('up')) {
            // Accelerate the player in the right direction
            this.accel.x = Math.cos(this.angle*Math.PI/180)*this.speed;
            this.accel.y = (Math.sin(this.angle*Math.PI/180)*this.speed);
        }

        else if (ig.input.state('down')) {
            // Accelerate the player in the right direction
            this.accel.x = Math.cos(this.angle*Math.PI/180)*-this.speed;
            this.accel.y = (Math.sin(this.angle*Math.PI/180)*-this.speed);
        } 

        else {
            this.accel.y = 0;
            this.accel.x = 0;
        }
    },

    checkDetection: function() {
        this.detected = ig.game.controller.checkDetection(this);
        if (this.detected) {
            console.log('detected');
        //    this.kill();
        }
    },

    checkPregnancy: function() {
        if (this.pregnancyTimer.delta() > 0) {
            this.pregnant = false;
            var posX = this.pos.x + this.size.x / 2;
            var posY = this.pos.y + this.size.y / 2;
            for (var i = 0; i < this.babyQuant; i++) {
                ig.game.spawnEntity(EntityBabyflea, posX, posY);
                posX += 5;
                posY += 5;
            }
            this.pregnancyTimer.reset();
            this.pregnancyTimer.pause();
        }
    },

    check: function(other) {

        if (other.fertility > 0 && ig.input.pressed('space')) {
            other.fertility--;
            other.hideFlea();
            console.log('pregnant');
            this.babyQuant = ig.game.controller.randomFromTo(1,3);
            this.pregnancyTimer.unpause();
            this.pregnant = true;
        }
        this.parent();
    },

    draw: function() {
        this.parent();
    }

});
});