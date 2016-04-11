var Menu = new function(){

    var Logger = require('../logger/logger');
    var Newton = require('../newton/newton');
    var GA     = require('../ga/ga');
    var VHost  = require('../vhost/vhost');
    
    this.show = function(style){
        Logger.info('GamifiveSDK', 'Menu', 'showMenu', style);
    }

    this.hide = function(){
        Logger.info('GamifiveSDK', 'Menu', 'hideMenu');
    }

    this.open = function(){
        Logger.info('GamifiveSDK', 'Menu', 'open');
    }

    this.close = function(){
        Logger.info('GamifiveSDK', 'Menu', 'close');
    }
};

module.exports = Menu;