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

    type: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,

    animSheet: new ig.AnimationSheet( 'media/cateye.png', 49, 49 ),

    init: function( x, y, settings ) {
        this.anims.idle = new ig.Animation( this.animSheet, 0, [0], true );
        this.parent( x, y, settings );
        if (this.primaryEye) {
            ig.game.spawnEntity(EntityCateye, 314, 161, {parentEye: this});
            ig.game.spawnEntity(EntityEyeguide, 0, 0, {parentEye: this});
        }
        this.currentAnim = this.anims.idle;
    },

    update: function() {
        if (this.primaryEye) {
            if (this.distanceTo(ig.game.eyeGuide) > ig.game.eyeGuide.minDistance) {
                var r = Math.atan2(ig.game.eyeGuide.pos.y-this.pos.y, ig.game.eyeGuide.pos.x-this.pos.x);
                var vely = Math.sin(r) * this.speed;
                var velx =  Math.cos(r) * this.speed;
                this.vel.x = velx;
                this.vel.y = vely;
            }

            else {
                this.vel.x = 0;
                this.vel.y = 0;
            }
        }
        else {
            this.pos.x = this.parentEye.pos.x + 185;
            this.pos.y = this.parentEye.pos.y;
        }
        this.parent();
    },

    draw: function() {
        this.parent();
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
        if (this.distanceTo(this.parentEye) <= this.minDistance) {
            if (this.timerPaused) {
                this.timerPaused = false;
                this.lookTimer.unpause();
                console.log('unpaused');
            }
        }
        this.parent();
    },

    pickGazeTarget: function() {
        this.pos.x = ig.game.controller.randomFromTo(75 + 25, 181 - 25);
        this.pos.y = ig.game.controller.randomFromTo(110 + 25, 216 - 25);
        console.log('x: ' + this.pos.x + ' y: ' + this.pos.y);
    },

    draw: function() {
        this.parent();
    }
});

});