ig.module(
	'game.entities.gui'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityGui = ig.Entity.extend({
    type: ig.Entity.TYPE.NONE,
    size: {x:1, y:1},
    zIndex: 2,
    femaleThumb: new ig.Image( 'media/femalethumb.png' ),
    maleThumb: new ig.Image( 'media/malethumb.png' ),

    heartIcon: new ig.Image('media/heart.png'),

	init: function(x, y, settings) {
     //   this.idle = new ig.Animation( this.animSheet, 0, [0], true );
        this.parent(x, y, settings);
        this.ctx = ig.game.ctx;
    },
	
    update: function() {
        if (ig.input.pressed('mute')) {
            if (!this.musicMuted) {
                ig.music.pause();
                this.musicMuted = true;
                this.muteText = 'unmute';
            }
            else {
                ig.music.play();
                this.musicMuted = false;
                this.muteText = 'mute';
            }
        }
        this.parent();
    },

    draw: function() {
    //    this.parent();
        if (ig.game.currentLevel === LevelMain) {
            this.drawMainStats();
        }
        else if (ig.game.currentLevel === LevelEnd) {
            this.drawScore();
        }
    },

    /******* OTHER FUNCITONS *******/
    drawMainStats: function() {
        this.ctx.font = '15pt Lucida Console';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        var x = ig.system.width - 132,
            y = 20;
        for (var i = 0; i < ig.game.player.lives; i++) {
            this.heartIcon.draw(x,y);
            x += 35;
        }
        x = ig.system.width - 75,
        y += 55;
        this.ctx.fillText('Score: ',  x, y);
    //    x += 5;
        y += 65;
        this.ctx.font = '50pt Lucida Console';
        this.ctx.fillText(ig.game.controller.score, x, y);
        this.ctx.font = '15pt Lucida Console';
        y += 30;
        this.ctx.fillText((ig.game.controller.totalFleas.male + ig.game.controller.totalFleas.female) + ' fleas!', x, y);
        y += 10;
        x -= 30;
        for (var i = 0; i < ig.game.controller.totalFleas.male; i++) {
            this.maleThumb.draw(x,y);
            y += 15;
        }
        y = 180;
        x += 31;
        for (var i = 0; i < ig.game.controller.totalFleas.female; i++) {
            this.femaleThumb.draw(x,y);
            y += 15;
        }
    },

    drawScore: function() {
        this.ctx.textAlign = 'center';
        this.ctx.font = '250pt Lucida Console';
        this.ctx.fillStyle = '#ffffff';
        var x = ig.system.width / 2.3;
        var y = 502;
        this.ctx.fillText(ig.game.controller.score, x, y);
    }

});


ig.global.EntityNotification = ig.Entity.extend({
    type: ig.Entity.TYPE.NONE,
    size: {x:1, y:1},
    zIndex: 2,
    notification: null,
   
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.ctx = ig.game.ctx;
        var allNotifications = ig.game.getEntitiesByType(EntityNotification);
        if (allNotifications.length > 1) {
            this.pos.y -= allNotifications[allNotifications.length - 1].pos.y -= 20;
        }
        else {
            this.pos.x = ig.system.width;
            this.pos.y = ig.system.height - 25;
        }

    },
    
    update: function() {
        if (this.pos.y !== 0) {
            this.parent();
            if (this.pos.x < -500) {
                this.kill();
            }
        }
    },

    draw: function() {
        this.ctx.font = '15pt Lucida Console';
        this.ctx.fillStyle = '#ffffff';
        ig.game.ctx.fillText(this.notification, this.pos.x, this.pos.y);
        this.pos.x -= 5;
    },




});
});

