ig.module(
	'game.main'
)
.requires(
	'impact.game',
	'impact.font',

	'game.misc.controller',

	'game.entities.cat',
	'game.entities.player',
	'game.entities.flea',
	'game.entities.gui',

	'game.levels.title',
	'game.levels.main'

//	'impact.debug.debug'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	currentLevel: null,
	controller: new ig.Controller(),
	
	clearColor: '#821003',


	init: function() {
		// Initialize your game here; bind keys etc.
		ig.input.bind( ig.KEY.MOUSE1, 'click' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.UP_ARROW, 'up');
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind( ig.KEY.SPACE, 'space' );
		ig.input.bind( ig.KEY.ESC, 'esc' );
		this.ctx = ig.system.context;
		this.loadLevel(LevelTitle); // Load main menu
	},
	
	loadLevel: function(data) {
		this.currentLevel = data;
		this.parent( data );
	//	this.screen.x = 20;
	//	this.screen.y = 20;
		if (this.currentLevel === LevelMain) {
			this.controller.score = 0; // Reset score to 0
			this.spawnEntity(EntityCat, 0, 0); // Spawn the cat!
			for (var i = 0; i < 5; i++) {
				var spawn = this.controller.setRandomLocation();
				this.spawnEntity(EntityGui, 0, 0);
				this.spawnEntity(EntityFlea, spawn.x, spawn.y, {kind: 'male'});
			}
		}
	},

	update: function() {
		// Update all entities and backgroundMaps

		if (this.currentLevel === LevelTitle) {
			if (ig.input.pressed('space')) {
				this.loadLevel(LevelMain);
			}
		}
		this.parent();
		
	},

	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 1000, 780, 1 );

});
