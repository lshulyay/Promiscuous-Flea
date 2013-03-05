ig.module(
	'game.main'
)
.requires(
	'impact.game',
	'impact.font',

	'game.misc.controller',

	'game.entities.cat',

	'game.levels.main',

	'impact.debug.debug'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	currentLevel: null,
	controller: new ig.Controller(),
	
	init: function() {
		// Initialize your game here; bind keys etc.
		ig.input.bind( ig.KEY.MOUSE1, 'click' );
		this.ctx = ig.system.context;
		this.loadLevel(LevelMain);
	},
	
	loadLevel: function(data) {
		this.currentLevel = data;
		this.parent( data );
		if (this.currentLevel === LevelMain) {
			this.spawnEntity(EntityCat, 0, 0);
		}
	},

	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		// Add your own, additional update code here
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps

		this.parent();
		// Add your own drawing code here
		var x = ig.system.width/2,
			y = ig.system.height/2;
		
		this.font.draw( 'mouse x: ' + ig.input.mouse.x + ' mouse y: ' + ig.input.mouse.y, x, y, ig.Font.ALIGN.CENTER );
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 440, 390, 2 );

});
