/* This controller class contains most tree growing functions and some generic utility functions */
ig.module(
	'game.misc.pool'
)
.requires(
	'impact.impact'
)
.defines(function(){"use strict";

ig.Pool = ig.Class.extend({

	allEntitiesArr: [],
	allEggsArr: [],
	femaleEntitiesArr: [],

	addToPool: function(entity,arr) {
		arr.push(entity);
	},

	useObject: function(object,attributes) {
		var poolArr = null;
		var entityType = null;
		switch(object) {
			case 'flea': 
				poolArr = this.allEntitiesArr;
				entityType = 'EntityFlea';
				break;
			case 'egg':
				poolArr = this.allEggsArr;
				entityType = 'EntityBabyflea';
				break;
		}
		var entity = poolArr[0];
		if (entity.inUse === false) {
			// Set additional attributes
			for(var propt in attributes){
				entity[propt] = attributes[propt];
			}
			entity.initialize();
			entity.inUse = true;
			this.moveArrElement(poolArr,0,poolArr.length - 1);
		//	return entity;
		}
		else {
			console.log('rearrange array');
			var foundAvailableEntity = false;
			for (var i = poolArr.length - 1; i > 0; i--) {
				entity = poolArr[i];
				if (!entity.inUse) {
					this.moveArrElement(poolArr,i,0);
					foundAvailableEntity = true;
				}
				else if (entity === poolArr[poolArr.length - 1] && !foundAvailableEntity) {
					console.log('spawning extra');
					ig.game.spawnEntity(entityType, 0, 0);
				}
			}
			this.useObject(object,attributes);
		}
	},

	removeEntity: function(entity) {
		entity.inUse = false;
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