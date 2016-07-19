var Constants = require('../constants/constants');
var GA        = require('../ga/ga');
var Location  = require('../location/location');
var Logger    = require('../logger/logger');
var Newton    = require('../newton/newton');
var VHost     = require('../vhost/vhost');

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
    var goToHomeCallback;

    this.setGoToHomeCallback = function(callback){
        goToHomeCallback = callback;
    }

    VHost.afterLoad(function(){
        menuSprite = VHost.get('IMAGES_SPRITE_GAME');
        menuInstance.show();
    });

    var applyCurrentStyle = function(){
        if (menuElement){
            for (var key in menuStyle){
                menuElement.style[key] = menuStyle[key];
            }
        }
    }

    var setDefaultStyle = function(){
        menuStyle = {};
        
        var defaultStyle = Constants.DEFAULT_MENU_STYLE;
        for (var key in defaultStyle){
            menuStyle[key] = defaultStyle[key];
        }
    }

    /**
    * resets the style of the menu to its default value
    * @function resetStyle
    * @memberof Menu
    */
    this.resetStyle = function(){
        setDefaultStyle();
        applyCurrentStyle();
    }

    /**
    * sets a custom style for the menu
    * @function setCustomStyle
    * @memberof Menu
    */
    this.setCustomStyle = function(customStyle){
        // override menu style
        if (customStyle){
            for (var key in customStyle){
                if (Constants.IMMUTABLE_MENU_STYLE_PROPERTIES.indexOf(key) < 0){
                    menuStyle[key] = customStyle[key];
                }
            }
        }

        applyCurrentStyle();
    }

    /**
    * shows the menu
    * @function show
    * @memberof Menu
    */
    this.show = function(customStyle){
        Logger.info('GamifiveSDK', 'Menu', 'show', customStyle);

        if (!menuStyle){
            // create default
            setDefaultStyle();
        }

        if (!!menuSprite){
            menuStyle['background-image'] = 'url(\'' + menuSprite + '\')';
        }

        // create DOM element if it doesn't exist
        if (!menuElement){
            menuElement = document.createElement('a');
            menuElement.addEventListener('touchend', goToHomeCallback, false);
            menuElement.addEventListener("click", goToHomeCallback, false);
            menuElement.setAttribute("id", "gfsdk-more-games");
            document.body.appendChild(menuElement);
        }

        menuInstance.setCustomStyle(customStyle);
        menuElement.style.display = 'block';
    }

    /**
    * hides the menu
    * @function hide
    * @memberof Menu
    */
    this.hide = function(){
        Logger.info('GamifiveSDK', 'Menu', 'hide');
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