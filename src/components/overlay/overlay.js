var Logger   = require('../logger/logger');

/**
* Overlay module
* @namespace Overlay
* @version 0.9
*/
var Overlay = new function(){

    var DEFAULT_ELEMENT_ID = 'gfsdk_root';

    /**
    * Create and fill DOM element
    * @function create
    * @memberof Overlay    
    * @param {String} html html code to fill dom element
    * @param {String} id element id
    */
    this.create = function(html, id){
        // default id if undefined
        var overlayId = id || DEFAULT_ELEMENT_ID;

        if(!document.getElementById(overlayId)){
            var element = document.createElement('div');
            element.id = overlayId;
            // add to DOM
            document.body.appendChild(element);
            // stop propagation events
            var stopPropagation = function(e) {e.stopPropagation();}
            element.addEventListener('touchmove', stopPropagation);
            element.addEventListener('touchstart', stopPropagation);
            element.addEventListener('touchend', stopPropagation);
            // fill html of element
            element.innerHTML = html;

            Logger.log('GamifiveSDK', 'Overlay', 'create', element);
        }
    },

    /**
    * Delete DOM element
    * @function delete
    * @memberof Overlay
    * @param {String} id element id
    */
    this.delete = function(id){
        
        var overlayId = id || DEFAULT_ELEMENT_ID;

        if(!!document.getElementById(overlayId)){

            var element = document.getElementById(overlayId);
            document.body.removeChild(element);

            Logger.log('GamifiveSDK', 'Overlay', 'delete', element);
        }
    }
};

module.exports = Overlay;