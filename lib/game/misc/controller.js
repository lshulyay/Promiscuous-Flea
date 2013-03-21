/* This controller class contains most tree growing functions and some generic utility functions */
ig.module(
	'game.misc.controller'
)
.requires(
	'impact.impact'
)
.defines(function(){"use strict";

ig.Controller = ig.Class.extend({

	score: 0,
	difficulty: 1,
	totalFleas: {female: 0, male: 0},

	checkDetection: function(posX,posY,sizeX) {
		var primaryEye = ig.game.primaryEye;
		var detected = false;
		var dist = Math.sqrt(Math.pow(primaryEye.pointOfSight.x - posX,2)+Math.pow(primaryEye.pointOfSight.y - posY,2));
		if (dist<(primaryEye.sightArea + sizeX + sizeX / 2)) detected = true;
		return detected;
    },

	setRandomLocation: function(checkDetection) {
		var spawnX = this.randomFromTo(25,850);
		var spawnY = this.randomFromTo(25,745);
		var detected = false;
		if (checkDetection === true) {
			detected = this.checkDetection(spawnX,spawnY,31);
		};

		if (spawnX >= 150 && spawnX <= 360 &&
			spawnY >= 220 && spawnY <= 433) {
			// Spawned in the eye! Try again.
			return this.setRandomLocation(checkDetection);
		}
		else if (spawnX >= 522 && spawnX <= 735 &&
				spawnY >= 220 && spawnY <= 433) {
			// Spawned in the other eye! Try again.
			return this.setRandomLocation(checkDetection);
		}

		else if (detected) {
			return this.setRandomLocation(checkDetection);
		}
		else {
			// Spawned in a good location.
			return {x: spawnX, y: spawnY};
		}
	},

	calcScore: function(score) {
		this.score += score;
		if (this.score%5 === 0) {
			this.difficulty += 0.5;
			ig.game.primaryEye.sightArea = ig.game.primaryEye.defaultSightArea * this.difficulty;
		}
	},

	/******* UTILITY FUNCTIONS *******/

	randomFromTo: function(from, to) {
       return Math.floor(Math.random() * (to - from + 1) + from);
    },

    inArray: function(arr, obj) {
		return (arr.indexOf(obj) != -1);
	},

	// Calculate what percentage of value2 value1 is.
	calcPercentage: function(value1,value2) {
		return 100 * value1 / value2;
	},

	// Calculate a value2 for targetpercent of value1.
	calcTargetPercentageValue: function(targetpercent,value1) {
		return targetpercent * value1 / 100;
	},

	// Pick a random color.
	pickRandomColor: function(rFrom,rTo,gFrom,gTo,bFrom,bTo) {
		var r = this.randomFromTo(rFrom,rTo);
		var g = this.randomFromTo(gFrom,gTo);
		var b = this.randomFromTo(bFrom,bTo);
		return {r: r, g: g, b: b};
	},

	// Transition color smoothly into next closest shade.
	transitionColor: function(currentColor,targetColor) {
		if (currentColor > targetColor) {
			currentColor -= 5;
		}
		else if (currentColor < targetColor) {
			currentColor += 5;
		}
		return currentColor;
	},

	// Pause game and music.
	pause: function() {
		if (!ig.game.paused) {
			ig.music.pause();
		}
		else {
			ig.music.play();
		}
		ig.Timer.timeScale = (ig.Timer.timeScale === 0 ? 1 : 0);
		this._paused = ig.Timer.timeScale === 0;
		ig.game.paused = !(ig.game.paused);
	}


});

});