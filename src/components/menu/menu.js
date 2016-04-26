var Logger = require('../logger/logger');
var Newton = require('../newton/newton');
var GA     = require('../ga/ga');
var VHost  = require('../vhost/vhost');

/**
* Gameplay page menu module (old "more games button")
* @namespace Menu
* @version 0.9
*/
var Menu = new function(){

    var menuInstance = this;
    
    var menuElement;
    var menuStyle;
    var menuSprite;

    /**
    * sets the callback to be executed in order to perform a redirect to the main page of the app
    * @function goToHomeCallback
    * @memberof Menu
    */
    var goToHomeCallback = function(){
        Logger.warn('GamifiveSDK', 'Menu', 'goToHomeCallback not set');
    }

    /**
    * initializes the Menu
    * @function init
    * @memberof Menu
    */
    this.init = function(params){
        Logger.log('GamifiveSDK', 'Menu', 'init', params);

        if (typeof moreGamesButtonSprite === 'undefined'){
            VHost.afterLoad(function(){
                menuSprite = VHost.get('MORE_GAMES_BUTTON_SPRITE');
            });
        } else {
            menuSprite = moreGamesButtonSprite;
        }
        
        if (!!params && typeof params.goToHomeCallback !== 'undefined'){

            if (typeof params.goToHomeCallback === 'function'){
                goToHomeCallback = params.goToHomeCallback;
            } else {
                Logger.error('GamifiveSDK', 'Menu', 'reset', 'goToHomeCallback must be a function, got "' 
                    + typeof params.goToHomeCallback + '"');
            }
        }
    }

    /**
    * resets the style of the menu to its default value
    * @function resetStyle
    * @memberof Menu
    */
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

    /**
    * sets a custom style for the menu
    * @function setCustomStyle
    * @memberof Menu
    */
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

    /**
    * shows the menu
    * @function show
    * @memberof Menu
    */
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

    /**
    * hides the menu
    * @function hide
    * @memberof Menu
    */
    this.hide = function(){
        Logger.info('GamifiveSDK', 'Menu', 'hideMenu');
        menuInstance.close();
        if (menuElement){
            menuElement.style.display = 'none';
        }
    }

    /**
    * opens the menu to show more options
    * @function open
    * @memberof Menu
    */
    this.open = function(){
        Logger.warn('GamifiveSDK', 'Menu', 'open', 'not implemented');
    }

    /**
    * closes the menu
    * @function close
    * @memberof Menu
    */
    this.close = function(){
        Logger.warn('GamifiveSDK', 'Menu', 'close', 'not implemented');
    }
};

module.exports = Menu;