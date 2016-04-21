var Logger = require('../logger/logger');

var Location = new function(){

    var locationInstance = this;
    
    this.getOrigin = function(){
        var stargateWebappOriginIsDefined = typeof Stargate !== 'undefined' 
                                            && typeof Stargate.conf !== 'undefined'
                                            && typeof Stargate.conf.getWebappOrigin === 'function';
        if (stargateWebappOriginIsDefined){
            return Stargate.conf.getWebappOrigin();
        }

        if (!window.location.origin) {
          window.location.origin = window.location.protocol + "//" 
                                    + window.location.hostname 
                                    + (window.location.port ? ':' + window.location.port: '');
        }
        return window.location.origin;
    }
};

module.exports = Location;