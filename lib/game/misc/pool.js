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
	femaleEntitiesArr: [],

	addToPool: function(entity,arr) {

		arr.push(entity);
	},

	useObject: function(object,attributes) {
		switch(object) {
			case 'flea': 
				var entity = this.allEntitiesArr[0];
				if (entity.inUse === false) {
					// Set additional attributes
					for(var propt in attributes){
						entity[propt] = attributes[propt];
					}
					entity.initialize();
					entity.inUse = true;
					this.moveArrElement(this.allEntitiesArr,0,this.allEntitiesArr.length - 1);
				//	return entity;
				}
				else {
					console.log('rearrange array');
					for (var i = this.allEntitiesArr.length - 1; i > 0; i--) {
						var entity = this.allEntitiesArr[i];
						if (!entity.inUse) {
							this.moveArrElement(this.allEntitiesArr,i,0);
						}
						this.useObject(object,attributes);
					}
				}
				break;
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
	//	console.log('moved');
		return array;
	}


});

});