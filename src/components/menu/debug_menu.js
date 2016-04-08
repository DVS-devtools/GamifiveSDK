var Logger = require('../logger/logger');

var Menu = new function(){
    
    this.showMoreGamesButton = function(style){
        Logger.error('GamifiveSDK', 'Menu', 'showMoreGamesButton', 'not implemented');
    }

    this.hideMoreGamesButton = function(){
        Logger.error('GamifiveSDK', 'Menu', 'hideMoreGamesButton', 'not implemented');
    }  
};

module.exports = Menu;