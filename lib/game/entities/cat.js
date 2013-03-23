ig.module(
	'game.entities.cat'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityCat = ig.Entity.extend({
    type: ig.Entity.TYPE.NONE,
    size: {x:1, y:1},
    zIndex: 2,
    
    animSheet: new ig.AnimationSheet( 'media/catface.png', 420, 370 ),

	init: function(x, y, settings) {
        this.parent(x, y, settings);
        if( !ig.global.wm ) {
            // Spawn the cat's primary eye
            ig.game.spawnEntity(EntityCateye, 254, 322, {primaryEye: true});
        }
    },
	
    update: function() {
        this.parent();
    },

    draw: function() {
        this.parent();
    }

});

ig.global.EntityCateye = ig.Entity.extend({
    size: {x: 1, y: 1},
    pos: {x: 0, y: 0},
    offset: {x: 49, y: 49},
    gravityFactor: 0,
    maxVel: {x: 50, y: 50},
    speed: 30,
    friction: { x: 0, y: 0 },
    zIndex: 1,
    radius: 2,
    gazeTarget: null,
    primaryEye: false,
    parentEye: null,
    angle: 0,
    sightRadius: 300,
    defaultSightArea: 80,
    sightArea: 80,
    newSightArea: 80,

    type: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,

    animSheet: new ig.AnimationSheet( 'media/cateye.png', 98, 98 ),

    init: function( x, y, settings ) {
        this.anims.idle = new ig.Animation( this.animSheet, 0, [0], true );
        this.parent( x, y, settings );

        // If this is the primary eye...
        if (this.primaryEye) {
            ig.game.primaryEye = this;
            // Spawn the secondary eye
            ig.game.spawnEntity(EntityCateye, 370, this.pos.y, {parentEye: this});
            // Spawn the eye guide
            ig.game.spawnEntity(EntityEyeguide, 0, 0, {parentEye: this});
            this.pointOfSight = {x: 0, y: 0};
        }
        // Set animation
        this.currentAnim = this.anims.idle;
    },

    update: function() {
        // If this is the primary eye...
        if (this.primaryEye) {
            // Calculate eye movement
            this.moveEyes();
            // Calculate point of sight
            this.pointOfSight = this.getPointOfSight();

            if (this.newSightArea > this.sightArea) {
                this.sightArea += 5;
            }

        }
        // If this is not the primary eye...
        else {
            // Set position and angle relative to the primary eye
            this.pos.x = this.parentEye.pos.x + 370;
            this.pos.y = this.parentEye.pos.y;
            this.angle = this.parentEye.angle;
        }
        // Set angle of eye animation
        this.anims.idle.angle = this.angle;
        this.parent();
    },

    moveEyes: function() {
        // If distance to the eye guide is too great...
        if (this.distanceTo(ig.game.eyeGuide) >= ig.game.eyeGuide.minDistance / 2) {
            // Move eye to the direction of the eye guide
            var r = Math.atan2(ig.game.eyeGuide.pos.y - this.pos.y, ig.game.eyeGuide.pos.x - this.pos.x);
            var vely = Math.sin(r) * this.speed;
            var velx =  Math.cos(r) * this.speed;
            this.vel.x = velx;
            this.vel.y = vely;

            var mx = ig.game.eyeGuide.pos.x;
            var my = ig.game.eyeGuide.pos.y;
            var eyeGuideAngle =  Math.atan2(
                my - (325),
                mx - (255)
            );

            // Rotate eye to look at eye guide
            var degEyeGuideAngle = eyeGuideAngle.toDeg();
            var angleStep = 3;
            if (this.angle.toDeg() > degEyeGuideAngle + 5) {
                this.angle -= angleStep.toRad();
            }

            else if (this.angle.toDeg() < degEyeGuideAngle - 5) {
                this.angle += angleStep.toRad();
            }
        }

        else {
            this.vel.x = 0;
            this.vel.y = 0;
        }
    },

    getPointOfSight: function() {
        // Specify pivot point, center of the circle
        var CenterX = this.pos.x + 370 / 2;
        var CenterY = this.pos.y;

        // Calculate and set appropriate x and y position
        var x = Math.cos(this.angle) * this.sightRadius + CenterX;
        var y = Math.sin(this.angle) * this.sightRadius + CenterY;    

        return {x: x, y: y};
    },

    draw: function() {
        this.parent();
        if (this.pointOfSight) {
            ig.game.ctx.fillStyle = "rgba(255,255,255,0.2)";
            ig.game.ctx.beginPath();
            ig.game.ctx.arc(this.pointOfSight.x,this.pointOfSight.y,this.sightArea,0,Math.PI*2,true);
            ig.game.ctx.fill();
        }
    }
});

ig.global.EntityEyeguide = ig.Entity.extend({
    size: {x: 1, y: 1},
    pos: {x: 0, y: 0},
    offset: {x: 25, y: 25},
    gravityFactor: 0,
    maxVel: {x: 500, y: 500},
    speed: 100,
    
    lookTime: 5,
    timerPaused: false,
    parentEye: null,
    minDistance: 5,

    type: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,


    init: function( x, y, settings ) {
        this.parent( x, y, settings );
        ig.game.eyeGuide = this;
        this.lookTimer = new ig.Timer(this.lookTime);
    },

    update: function() {
        if (this.lookTimer.delta() > 0) {
            this.pickGazeTarget();
            this.lookTimer.reset();
            this.lookTimer.pause();
            this.timerPaused = true;
        }
        else if (this.parentEye.vel.x <= 2) {
            if (this.timerPaused) {
                this.timerPaused = false;
                this.lookTimer.reset();
                this.lookTimer.unpause();
            }
        }
        this.parent();
    },

    pickGazeTarget: function() {
        this.pos.x = ig.game.controller.randomFromTo(150 + 49, 363 - 49);
        this.pos.y = ig.game.controller.randomFromTo(220 + 49, 435 - 49);
    },

    draw: function() {
        this.parent();
    }
});

});