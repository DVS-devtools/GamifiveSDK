var Menu = new function(){

    var menuInstance = this;

    var Logger = require('../logger/logger');
    var Newton = require('../newton/newton');
    var GA     = require('../ga/ga');
    var VHost  = require('../vhost/vhost');
    
    var menuElement;
    var menuStyle;

    // default value
    var menuSprite = 'http://s.motime.com/img/wl/webstore_html5game/images/gameover/sprite.png?v=' + Date.now();

    VHost.afterLoad(function(){
        menuSprite = VHost.get('MORE_GAMES_BUTTON_SPRITE');
    });

    var goToHomeCallback = function(){
        Logger.warn('GamifiveSDK', 'Menu', 'goToHomeCallback not set');
    }

    this.init = function(params){
        Logger.log('GamifiveSDK', 'Menu', 'init', params);

        if (!!params && typeof params.goToHomeCallback !== 'undefined'){

            if (typeof params.goToHomeCallback === 'function'){
                goToHomeCallback = params.goToHomeCallback;
            } else {
                Logger.error('GamifiveSDK', 'Menu', 'reset', 'goToHomeCallback must be a function, got "' 
                    + typeof params.goToHomeCallback + '"');
            }
        }
    }

    this.resetStyle = function(){
        menuStyle = {};
        menuStyle.left = '2px' ;
        menuStyle.height = '44px';
        menuStyle['background-position'] = '-22px -428px';
        menuStyle.top = '50%';
        menuStyle['margin-top'] = '-22px';
        menuStyle['z-index'] = "9";
        menuStyle.width = '43px';
        menuStyle.position = 'absolute';
        menuStyle['background-image'] = 'url(' + menuSprite + ')';
    }

    this.setCustomStyle = function(customStyle){
        if (!menuStyle){
            menuInstance.resetStyle();
        }
        // override menu style
        if (customStyle){
            for (var key in customStyle){
                menuStyle[key] = customStyle[key];
            }   
        }
    }

    this.show = function(customStyle){
        Logger.info('GamifiveSDK', 'Menu', 'showMenu', customStyle);

        // create DOM element if it doesn't exist
        if (!menuElement){
            menuElement = document.createElement('a');
            menuElement.addEventListener('touchend', goToHomeCallback, false);
            menuElement.addEventListener("click", goToHomeCallback, false);
            menuElement.setAttribute("id", "gfsdk-more-games");
            document.body.appendChild(menuElement);
        }

        menuInstance.setCustomStyle(customStyle);

        // apply menu style to element
        for (var key in menuStyle){
            menuElement.style[key] = menuStyle[key];
        }

        menuElement.style.display = 'block';
    }

    this.hide = function(){
        Logger.info('GamifiveSDK', 'Menu', 'hideMenu');
        menuInstance.close();
        if (menuElement){
            menuElement.style.display = 'none';
        }
    }

    this.open = function(){
        Logger.warn('GamifiveSDK', 'Menu', 'open', 'not implemented');
    }

    this.close = function(){
        Logger.warn('GamifiveSDK', 'Menu', 'close', 'not implemented');
    }
};

module.exports = Menu;