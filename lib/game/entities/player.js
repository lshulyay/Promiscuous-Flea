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
    size: {x: 31, y: 31},
    gravityFactor: 0,
    zIndex: 2,

    // Detection
    detected: false,

    // Babymaking
    pregnant: false,
    pregnancyTimer: new ig.Timer(2),

    // Movement
    maxVel: {x: 150, y: 150},
    friction: {x: 500, y: 500},
    angle: 0,
    accelGround: 700,
    accelAir: 700,
    speed: 200,
    accelTurnSpeed: 250,
    
    animSheet: new ig.AnimationSheet( 'media/player.png', 31, 31 ),
    animSheetHumping: new ig.AnimationSheet( 'media/humping-fleas.png', 44, 31 ),

	init: function(x, y, settings) {
        this.anims.idle = new ig.Animation( this.animSheet, 0, [0], true );
        this.anims.walking = new ig.Animation( this.animSheet, 0.1, [0,1,2,1,0,3,4,3] );
        this.anims.humping = new ig.Animation( this.animSheetHumping, 0.035, [0,1,2,3,4,5,4,3,2,1,0,1,2,3,4,5,4,3,2,1,0,1,2,3,4,5,4,3,2,1] );
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
        if (this.currentAnim === this.anims.humping && this.currentAnim.loopCount > 0) {
            this.currentAnim = this.anims.idle;
            this.babyQuant = ig.game.controller.randomFromTo(1,3);
            this.pregnancyTimer.unpause();
            this.pregnant = true;
        }

        if (this.pregnant) {
            this.checkPregnancy();
        }

        this.parent();
    },

    checkMovement: function() {
        if (this.currentAnim !== this.anims.humping) {
            if (ig.input.state('right')) {
                this.angle += this.accelTurnSpeed * ig.system.tick;
            }
            
            else if (ig.input.state('left')) {
                this.angle -= this.accelTurnSpeed * ig.system.tick;
            }


            if (ig.input.state('up')) {
                // Accelerate the player in the right direction
                this.vel.x = Math.cos(this.angle*Math.PI/180)*this.speed;
                this.vel.y = (Math.sin(this.angle*Math.PI/180)*this.speed);
            }

            else if (ig.input.state('down')) {
                // Accelerate the player in the right direction
                this.vel.x = Math.cos(this.angle*Math.PI/180)*-this.speed;
                this.vel.y = (Math.sin(this.angle*Math.PI/180)*-this.speed);
            } 

            else {
                this.vel.y = 0;
                this.vel.x = 0;
            }

            if (ig.input.state('right') || ig.input.state('left') || this.vel.x !== 0 || this.vel.y !== 0) {
                if (this.currentAnim !== this.anims.walking) {
                    this.currentAnim = this.anims.walking;
                }
            }
            else {
                this.currentAnim = this.anims.idle;
            }
        }
    },

    checkDetection: function() {
        this.detected = ig.game.controller.checkDetection(this.pos.x,this.pos.y,this.size.x);
        if (this.detected) {
            console.log('detected');
        }
    },

    checkPregnancy: function() {
        if (this.pregnancyTimer.delta() > 0) {
            this.pregnant = false;
            var posX = this.pos.x + this.size.x / 2;
            var posY = this.pos.y + this.size.y / 2;
            for (var i = 0; i < this.babyQuant; i++) {
                ig.game.spawnEntity(EntityBabyflea, posX, posY);
                posX += 10;
                posY += 10;
            }
            this.pregnancyTimer.reset();
            this.pregnancyTimer.pause();
        }
    },

    check: function(other) {

        if (other.fertility > 0 && !other.justBorn && !this.pregnant && ig.input.pressed('space')) {
            other.fertility--;
            other.hideFlea(false);
            var tempAngle = other.currentAnim.angle;
            this.currentAnim = this.anims.humping.rewind();
            ig.game.humpingSound.play();
            this.currentAnim.angle = tempAngle;
        }
        this.parent();
    },

    draw: function() {
        this.parent();
    }

});
});