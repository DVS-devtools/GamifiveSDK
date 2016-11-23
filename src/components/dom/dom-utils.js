var Constants = require('../constants/constants');
var Logger    = require('../logger/logger');
var VHost = require('../vhost/vhost')

/**
* DOMUtils module
* @namespace DOMUtils
* @version 0.9
*/
var DOMUtils = new function(){

    /**
    * Create and fill DOM element
    * @function create
    * @memberof DOMUtils    
    * @param {String} html html code to fill dom element
    * @param {String} id element id
    */
    this.create = function(html, id){
        // default id if undefined
        var elementId = id || Constants.OVERLAY_ELEMENT_ID;

        if(!document.getElementById(elementId)){
            var element = document.createElement('div');
            element.id = elementId;
            // add to DOM
            document.body.appendChild(element);
            // stop propagation events
            var stopPropagation = function(e) { e.stopPropagation(); }
            element.addEventListener('touchmove', stopPropagation);
            element.addEventListener('touchstart', stopPropagation);
            element.addEventListener('touchend', stopPropagation);
            // fill html of element
            element.innerHTML = html;

            Logger.log('GamifiveSDK', 'DOMUtils', 'create', element);
        }
    },

    /**
    * Delete DOM element
    * @function delete
    * @memberof DOMUtils
    * @param {String} id element id
    */
    this.delete = function(id){
        
        var elementId = id || Constants.OVERLAY_ELEMENT_ID;

        if(!!document.getElementById(elementId)){

            var element = document.getElementById(elementId);
            document.body.removeChild(element);

            Logger.log('GamifiveSDK', 'DOMUtils', 'delete', element);
        }
    }

    /**
    * Returns whether an element has the specified class
    * @function hasClass
    * @memberof DOMUtils
    * @param {string} id id of element
    * @param {string} className class name
    */
    this.hasClass = function(id, className) {
        return (' ' + document.getElementById(id).className + ' ').indexOf(' ' + className + ' ') > -1;
    }

    /**
    * Show element
    * @function show
    * @memberof DOMUtils
    * @param {string} id id of element
    */
    this.show = function(id){
        let theElement = document.getElementById(id);
        if(!!theElement){
            let className = '';
            if(this.hasClass(id, 'hide')){
                className = 'hide';
            } else if(this.hasClass(id, 'hidden')){
                className = 'hidden';
            }
            let regex = new RegExp('\s?'+ className, 'g');
            theElement.className = theElement.className.replace(regex, '');
            return true;
        }
        return false;
    }

    /**
    * Hide element
    * @function hide
    * @memberof DOMUtils
    * @param {string} id id of element
    */
    this.hide = function(id){
        if(!!document.getElementById(id)){
            if(!this.hasClass(id, "hide")){
                document.getElementById(id).className += " hide";
            }
        }
    }
    
    this.updateFavoriteButton = function(fill){
        
        // starting class
        var selector = VHost.get('GAMEOVER_LIKE_SELECTOR');
        var FILL_CLASS = VHost.get('GAMEOVER_LIKE_CLASS_TO_TOGGLE');
        var favoriteIconElement = document.querySelector(selector);
        
        if(fill){            
            favoriteIconElement.classList.add(FILL_CLASS);
        } else {            
            favoriteIconElement.classList.remove(FILL_CLASS);
        }           
    }
};

module.exports = DOMUtils;