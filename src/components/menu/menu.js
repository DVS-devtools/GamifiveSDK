var Menu = new function(){

    var Logger = require('../logger/logger');
    var Newton = require('../newton/newton');
    var GA     = require('../newton/ga');
    var VHost  = require('../vhost/vhost');
    
    this.showMenu = function(style){
        Logger.info('GamifiveSDK', 'Menu', 'showMenu', style);
    }

    this.hideMenu = function(){
        Logger.info('GamifiveSDK', 'Menu', 'hideMenu');
    }

    this.showMoreGamesButton = this.showMenu;
    this.hideMoreGamesButton = this.hideMenu;

    this.open = function(){
        Logger.info('GamifiveSDK', 'Menu', 'open');
    }

    this.close = function(){
        Logger.info('GamifiveSDK', 'Menu', 'close');
    }
};

module.exports = Menu;