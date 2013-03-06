ig.module(
	'game.entities.cat'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityCat = ig.Entity.extend({
    checkAgainst: ig.Entity.TYPE.NONE,
    size: {x:1, y:1},
    zIndex: 2,
    
    animSheet: new ig.AnimationSheet( 'media/catface.png', 420, 370 ),

	init: function(x, y, settings) {
     //   this.idle = new ig.Animation( this.animSheet, 0, [0], true );
        this.parent(x, y, settings);
        if( !ig.global.wm )    {
            ig.game.spawnEntity(EntityCateye, 127, 161, {primaryEye: true});
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
    offset: {x: 25, y: 25},
    gravityFactor: 0,
    maxVel: {x: 50, y: 50},
    speed: 30,
    friction: { x: 0, y: 0 },
    zIndex: 1,
    radius: 2,
    socketSize: 105,
    gazeTarget: null,
    primaryEye: false,
    parentEye: null,
    angle: 0,
    sightRadius: 300,

    type: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,

    animSheet: new ig.AnimationSheet( 'media/cateye.png', 49, 49 ),

    init: function( x, y, settings ) {
        this.anims.idle = new ig.Animation( this.animSheet, 0, [0], true );
        this.parent( x, y, settings );
        if (this.primaryEye) {
            ig.game.spawnEntity(EntityCateye, 314, 161, {parentEye: this});
            ig.game.spawnEntity(EntityEyeguide, 0, 0, {parentEye: this});
            this.pointOfSight = {x: 0, y: 0};
        }
        this.currentAnim = this.anims.idle;
    },

    update: function() {
        if (this.primaryEye) {
            this.moveEyes();
            this.pointOfSight = this.getPointOfSight();
            this.checkPlayerDetection();

        }

        else {
            this.pos.x = this.parentEye.pos.x + 185;
            this.pos.y = this.parentEye.pos.y;
            this.angle = this.parentEye.angle;
        }
        this.anims.idle.angle = this.angle;
        this.parent();
    },

    moveEyes: function() {
        if (this.distanceTo(ig.game.eyeGuide) >= ig.game.eyeGuide.minDistance / 2) {
            var r = Math.atan2(ig.game.eyeGuide.pos.y-this.pos.y, ig.game.eyeGuide.pos.x-this.pos.x);
            var vely = Math.sin(r) * this.speed;
            var velx =  Math.cos(r) * this.speed;
            this.vel.x = velx;
            this.vel.y = vely;

            var mx = ig.game.eyeGuide.pos.x + ig.game.screen.x;
            var my = ig.game.eyeGuide.pos.y + ig.game.screen.y;
            var eyeGuideAngle =  Math.atan2(
                my - (this.pos.y + this.size.y/2),
                mx - (this.pos.x + this.size.x/2)
            );
            var degEyeGuideAngle = eyeGuideAngle.toDeg();
            if (this.angle > eyeGuideAngle + 0.05) {
                this.angle -= 0.05;
            }

            else if (this.angle < eyeGuideAngle - 0.05) {
                this.angle += 0.05;
            }
        }

        else {
            this.vel.x = 0;
            this.vel.y = 0;
        }
    },

    getPointOfSight: function() {
        // Specify pivot point, center of the circle
        var CenterX = ig.system.width;
        var CenterY = this.pos.y * 2;
        // Calculate and set appropriate x and y position
        var x = Math.cos(this.angle) * this.sightRadius + CenterX;
        var y = Math.sin(this.angle) * this.sightRadius + CenterY;    
        return {x: x, y: y};
    },

    checkPlayerDetection: function() {
        var dist = Math.sqrt(Math.pow(this.pointOfSight.x - ig.game.player.pos.x,2)+Math.pow(this.pointOfSight.y - ig.game.player.pos.y,2));
        if (dist<(this.sightRadius + ig.game.player.size.x / 2)) {
            console.log('player detected!');
        }
    },

    draw: function() {
        this.parent();
        if (this.pointOfSight) {
            ig.game.ctx.fillStyle = "rgba(255,255,255,0.2)";
            ig.game.ctx.beginPath();
            ig.game.ctx.arc(this.pointOfSight.x,this.pointOfSight.y,70,0,Math.PI*2,true);
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
    minDistance: 10,

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
            console.log('paused');
        }
        else if (this.parentEye.vel.x <= 2) {
            if (this.timerPaused) {
                this.timerPaused = false;
                this.lookTimer.reset();
                this.lookTimer.unpause();
                console.log('unpaused');
            }
        }
        this.parent();
    },

    pickGazeTarget: function() {
        this.pos.x = ig.game.controller.randomFromTo(75 + this.parentEye.size.x / 2, 181 - this.parentEye.size.y / 2);
        this.pos.y = ig.game.controller.randomFromTo(110 + this.parentEye.size.y / 2, 216 - this.parentEye.size.y / 2);
        console.log('x: ' + this.pos.x + ' y: ' + this.pos.y);
    },

    draw: function() {
        this.parent();
    }
});

});