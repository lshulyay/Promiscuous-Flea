ig.module(
	'game.main'
)
.requires(
	'impact.game',
	'impact.font',

	'game.misc.controller',
	'game.misc.pool',

	'game.entities.cat',
	'game.entities.player',
	'game.entities.flea',
	'game.entities.gui',

	'game.levels.title',
	'game.levels.main',
	'game.levels.end'

//	'impact.debug.debug'
)
.defines(function(){
 
PromiscuousFlea = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	currentLevel: null,
	controller: new ig.Controller(),
	pool: new ig.Pool(),
	 
	clearColor: '#821003',

	// Load audio
	themeVocalsMusic: new ig.Sound( 'media/audio/theme-vocals.*', false ),
	humpingSound: new ig.Sound( 'media/audio/humping.*', false ),
	death1Sound: new ig.Sound( 'media/audio/death1.*', false ),
	death2Sound: new ig.Sound( 'media/audio/death2.*', false ),
	death3Sound: new ig.Sound( 'media/audio/death3.*', false ),
	death4Sound: new ig.Sound( 'media/audio/death4.*', false ),
	wheeSound: new ig.Sound( 'media/audio/whee.*', false ),
	ouchSound: new ig.Sound( 'media/audio/ouch.*', false ),
	gameoverSound: new ig.Sound( 'media/audio/gameover.*', false ),
	footstepSound: new ig.Sound( 'media/audio/footsteps.*', false ),
	birthSound: new ig.Sound( 'media/audio/birth.*', false ),

	init: function() {
		// Key bindings
		ig.input.bind( ig.KEY.MOUSE1, 'click' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.UP_ARROW, 'up');
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind( ig.KEY.SPACE, 'space' );
		ig.input.bind( ig.KEY.ESC, 'esc' );

		this.ctx = ig.system.context;

		// Add music
		ig.music.add( this.themeVocalsMusic, 'themeVocals' );
		ig.music.add( this.footstepSound, 'footstepMusic' );
		ig.music.loop = true;

		// Add death sounds
		this.deathSoundsArr = [this.death1Sound, this.death2Sound, this.death3Sound, this.death4Sound];

		// Load main menu
		this.loadLevel(LevelTitle);
	},
	
	loadLevel: function(data) {
		this.currentLevel = data;
		ig.music.stop();
		this.parent( data );
		// Spawn GUI entity
		this.spawnEntity(EntityGui, 0, 0);

		// If player is on main menu, play theme music
		if (this.currentLevel === LevelTitle) {
			ig.music.play('themeVocals');
		}

		// If player starts main game...
		else if (this.currentLevel === LevelMain) {
			for (var i = 0; i < 40; i++) {
				// Spawn 40 fleas for pool
				this.spawnEntity(EntityFlea, 0, 0, {inUse: false});
				if (i < 5) {
					// Spawn 5 eggs for pool
					this.spawnEntity(EntityBabyflea, 0, 0, {inUse: false});
				}
			}
			// Reset score to 0
			this.controller.score = 0;

			// Reset flea count
			this.controller.totalFleas = {male: 0, female: 0};

			// Spawn the cat!
			this.spawnEntity(EntityCat, 0, 0);
			
			// Spawn first 5 male and 5 female fleas
			for (var n = 0; n < 5; n++) {
				this.pool.useObject('flea', {kind: 'male'});
				this.pool.useObject('flea', {kind: 'female'});
			}
		}

		// If player loses...
		else if (this.currentLevel === LevelEnd) {
			// Make sure timeScale is 1 (depending on lose condition it gets sped up to 2)
			ig.Timer.timeScale = 1;
			// Play game over sound
			this.gameoverSound.play();

			// Reset all objects
			this.pool.removeAllObjects('flea');
			this.pool.removeAllObjects('egg');
		}
	},

	update: function() {
		// Change levels on space press
		if (this.currentLevel === LevelTitle) {
			if (ig.input.pressed('space')) {
				this.loadLevel(LevelMain);
			}
		}
		else if (this.currentLevel === LevelEnd) {
			if (ig.input.pressed('space')) {
				this.loadLevel(LevelTitle);
			}
		}
		this.parent();
		
	},

	draw: function() {
		this.parent();
	}
});

ig.main( '#canvas', PromiscuousFlea, 60, 1000, 780, 1 );

});
