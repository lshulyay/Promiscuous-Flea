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
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.UP_ARROW, 'up');
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind( ig.KEY.SPACE, 'space' );
		ig.input.bind( ig.KEY.ESC, 'esc' );
		this.ctx = ig.system.context;
		this.loadLevel(LevelMain);
	},
	
	loadLevel: function(data) {
		this.currentLevel = data;
		this.parent( data );
		if (this.currentLevel === LevelMain) {
			this.controller.score = 0;
			this.spawnEntity(EntityCat, 0, 0);
			for (var i = 0; i < 5; i++) {
				var spawn = this.controller.setRandomLocation();
				this.spawnEntity(EntityFlea, spawn.x, spawn.y, {kind: 'male'});
			}
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
		this.ctx.font = 'italic 17pt Calibri';
		this.ctx.fillStyle = '#ffffff';
		// Add your own drawing code here
		var x = 5,
			y = 25;
		this.ctx.fillText('Score: ' + this.controller.score, x, y);
		y += 27;
		this.ctx.fillText( 'Flea Population: ' + (this.controller.totalFleas.male + this.controller.totalFleas.female), x, y);
		y += 10;
		x += 4;
		this.ctx.save();
		for (var i = 0; i < this.controller.totalFleas.male; i++) {
			this.ctx.fillStyle = "#0000ff";
			this.ctx.fillRect(x, y, 10, 10);
			x += 12;
		}
		y += 13;
		x = 9;
		for (var i = 0; i < this.controller.totalFleas.female; i++) {
			this.ctx.fillStyle = "#ff0000";
			this.ctx.fillRect(x, y, 10, 10);
			x += 12;
		}	
		this.ctx.restore();	
		y = 120;
		x = 5;
		this.ctx.fillText( 'mouse x: ' + ig.input.mouse.x + ' mouse y: ' + ig.input.mouse.y, x, y);
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 880, 780, 1 );

});
