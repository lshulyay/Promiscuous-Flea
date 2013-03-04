ig.module(
	'game.entities.cat'
)
.requires(
	'impact.entity'
)

.defines(function(){

EntityCat = ig.Entity.extend({
    checkAgainst: ig.Entity.TYPE.NONE,
    size: {x:1, y:1},
    zIndex: 0,
    
    animSheet: new ig.AnimationSheet( 'media/catface.png', 420, 370 ),

	init: function(x, y, settings) {
        this.idle = new ig.Animation( animSheet, 0, [0], true );
        this.parent(x, y, settings);
    },
	
    update: function() {
        this.parent();
    },

    draw: function() {
        this.parent();
    }

});

EntityCateyes = ig.Entity.extend({
    size: {x: 5, y: 5},
    pos: {x: 0, y: 0},
    gravityFactor: 0,
    maxVel: {x: 500, y: 600},
    friction: { x: 0, y: 0 },
    zIndex: 5,
    radius: 2,

    type: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,

    init: function( x, y, settings ) {
        this.parent( x, y, settings );
    },

    update: function() {
        this.parent();
    },

    draw: function() {
        this.parent();
    }
});
});