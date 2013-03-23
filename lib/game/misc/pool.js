/* This controller class contains most tree growing functions and some generic utility functions */
ig.module(
	'game.misc.pool'
)
.requires(
	'impact.impact'
)
.defines(function(){"use strict";

ig.Pool = ig.Class.extend({

	allFleasArr: [],
	allEggsArr: [],

	addToPool: function(entity,arr) {
		arr.unshift(entity);
	},

	useObject: function(object,attributes) {
		// Set poolArr and entityType depending on which entity is being used
		var poolArr = null;
		var entityType = null;
		var entity = null;
		switch(object) {
			case 'flea': 
				poolArr = this.allFleasArr;
				entityType = 'EntityFlea';
				break;
			case 'egg':
				poolArr = this.allEggsArr;
				entityType = 'EntityBabyflea';
				break;
		}
		entity = poolArr[0]; // Get first entity in relevant pool

		// If the entity is not already in use...
		if (entity.inUse === false) {

			// Set any additional attributes
			for(var propt in attributes){
				entity[propt] = attributes[propt];
			}

			entity.initialize(); // Initialize entity
			entity.inUse = true;
			this.moveArrElement(poolArr,0,poolArr.length - 1); // Move the now used entity to the end of the pool
		}

		// If the entity IS already in use, either the array is cluttered or there are no free entities left in the pool...
		else {
			var foundAvailableEntity = false;
			// Loop through pool backwards
			for (var i = poolArr.length - 1; i > 0; i--) {
				entity = poolArr[i];
				// If the entity is not in use, move it to the front of the array
				if (!entity.inUse) {
					this.moveArrElement(poolArr,i,0);
					foundAvailableEntity = true;
				}
			}

			// If no available entities were found, spawn a new entity.
			if (!foundAvailableEntity) {
				ig.game.spawnEntity(entityType, 0, 0);
			}
			this.useObject(object,attributes);
		}
	},

	removeEntity: function(entity) {
		entity.inUse = false;
	},

	removeAllObjects: function(object) {
		var poolArr;
		switch (object) {
			case 'flea':
				poolArr = this.allFleasArr;
				break;
			case 'egg':
				poolArr = this.allEggsArr;
				break;
		}
		for (var i = 0; i < poolArr.length; i++) {
			var entity = poolArr[i];
			if (entity.inUse) {
			entity.inUse = false;
			}
		}
	},

	moveArrElement: function(array, old_index, new_index) {
		if (new_index >= array.length) {
			var k = new_index - array.length;
			while ((k--) + 1) {
				array.push(undefined);
			}
		}
		array.splice(new_index,0,array.splice(old_index, 1)[0]);
		return array;
	}


});

});