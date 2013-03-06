ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityPlayer = ig.Entity.extend({
    checkAgainst: ig.Entity.TYPE.NONE,
    size: {x: 30, y: 30},
    gravityFactor: 0,
    zIndex: 2,

    // Detection
    detected: false,

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
        if( !ig.global.wm ) {
            ig.game.controller.totalFleas.female++;
        }
        this.currentAnim = this.anims.idle;
    },
	
    update: function() {
        var accel = this.standing ? this.accelGround : this.accelAir;
        this.currentAnim.angle = this.angle.toRad();

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

        this.detected = ig.game.controller.checkDetection(this);
        if (this.detected) {
            console.log('detected');
        //    this.kill();
        }
        this.parent();
    },

    draw: function() {
        this.parent();
    }

});
});