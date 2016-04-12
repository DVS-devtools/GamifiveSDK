var Facebook = new function(){

    var Logger = require('../logger/logger');
    var Newton = require('../newton/newton');
    var GA     = require('../ga/ga');
    var VHost  = require('../vhost/vhost');

    this.init = function(params){
        Logger.log('GamifiveSDK', 'Facebook', 'init', params);
    }

    this.share = function(url, callback){
        Logger.info('GamifiveSDK', 'Facebook', 'share', url);
        if (typeof callback === 'function'){
            callback();
        } 
    }

    this.send = function(dataToSend, callback){
        Logger.info('GamifiveSDK', 'Facebook', 'send', dataToSend);
        if (typeof callback === 'function'){
            callback();
        }  
    }
};

module.exports = Facebook;