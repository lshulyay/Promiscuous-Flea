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
    pregnancyTimer: new ig.Timer(1.5),

    lives: 3,

    // Movement
    maxVel: {x: 150, y: 150},
    friction: {x: 500, y: 500},
    angle: 0,
    accelGround: 700,
    accelAir: 700,
    speed: 200,
    accelTurnSpeed: 250,
    footstepsPlaying: false,
    
    animSheet: new ig.AnimationSheet( 'media/player.png', 31, 31 ),
    animSheetHumping: new ig.AnimationSheet( 'media/humping-fleas.png', 44, 31 ),

	init: function(x, y, settings) {
        this.anims.idle = new ig.Animation( this.animSheet, 0, [0], true );
        this.anims.walking = new ig.Animation( this.animSheet, 0.1, [0,1,2,1,0,3,4,3] );
        this.anims.idlePregnant = new ig.Animation (this.animSheet, 0, [6], true);
        this.anims.walkingPregnant = new ig.Animation( this.animSheet, 0.1, [6,7,8,7,6,9,10,9] );
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
                if (this.footstepsPlaying === false) {
                    ig.music.play('footstepMusic');
                    this.footstepsPlaying = true;
                }
            }

            else if (ig.input.state('down')) {
                // Accelerate the player in the right direction
                this.vel.x = Math.cos(this.angle*Math.PI/180)*-this.speed;
                this.vel.y = (Math.sin(this.angle*Math.PI/180)*-this.speed);
                if (this.footstepsPlaying === false) {
                    ig.music.play('footstepMusic');
                    this.footstepsPlaying = true;
                }
            } 

            else {
                this.vel.y = 0;
                this.vel.x = 0;
                if (this.footstepsPlaying === true) {
                    ig.music.pause('footstepMusic');
                    this.footstepsPlaying = false;
                }                
            }

            if (!this.pregnant) {
                if (ig.input.state('right') || ig.input.state('left') || this.vel.x !== 0 || this.vel.y !== 0) {
                    if (this.currentAnim !== this.anims.walking) {
                        this.currentAnim = this.anims.walking;
                    }
                }
                else {
                    if (this.currentAnim !== this.anims.idle) {
                        this.currentAnim = this.anims.idle;
                    }
                }
            }
            else {
                if (ig.input.state('right') || ig.input.state('left') || this.vel.x !== 0 || this.vel.y !== 0) {
                    if (this.currentAnim !== this.anims.walkingPregnant) {
                        this.currentAnim = this.anims.walkingPregnant;
                    }
                }
                else {
                    if (this.currentAnim !== this.anims.idlePregnant) {
                        this.currentAnim = this.anims.idlePregnant;
                    }
                }
            }

        }
    },

    checkDetection: function() {
        var oldDetection = this.detected;
        this.detected = ig.game.controller.checkDetection(this.pos.x,this.pos.y,this.size.x);
        if (!oldDetection && this.detected) {
            ig.game.ouchSound.play();
            this.lives--;
            if (this.lives <= 0) {
                ig.game.loadLevel(LevelEnd);
            }
        }
    },

    checkPregnancy: function() {
        if (this.pregnancyTimer.delta() > 0) {
            this.pregnant = false;
            var posX = this.pos.x + this.size.x / 2;
            var posY = this.pos.y + this.size.y / 2;
            ig.game.birthSound.play();
            for (var i = 0; i < this.babyQuant; i++) {
                ig.game.pool.useObject('egg', {pos:{x: posX, y: posY}});
                posX += 10;
                posY += 10;
            }
            this.pregnancyTimer.reset();
            this.pregnancyTimer.pause();
        }
    },

    check: function(other) {
        if (ig.input.pressed('space') && other.visible && other.fertility > 0 && !other.justBorn && !this.pregnant) {
            other.fertility--;
            other.hideFlea(false);
            var tempAngle = other.currentAnim.angle;
            this.currentAnim = this.anims.humping.rewind();
            ig.game.humpingSound.play();
            this.currentAnim.angle = tempAngle;
            if (this.footstepsPlaying === true) {
                ig.music.pause('footstepMusic');
                this.footstepsPlaying = false;
            }
        }
        else if (ig.input.pressed('space') && other.visible && this.pregnant) {
            other.hideFlea(false);
        }
        this.parent();
    },

    draw: function() {
        this.parent();
    }

});
});