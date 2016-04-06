
var GamifiveSDKOffline = new function(){

    var Utils = GamifiveSDKUtils;
    var offlineInstance = this;
    var OFFLINE_DATA_FILENAME = 'offlineData.json';

    this.data = {
        GamifiveInfo: {},
        GaForGame: {},
        queues: {
            'newton': [],
            'ga': [],
            'xhr': []
        }
    }

    this.NEWTON_QUEUE = 'newton';
    this.GA_QUEUE = 'ga';
    this.XHR_QUEUE = 'xhr';

    this.enqueue = function(queue, item){
        offlineInstance.data.queues[queue].push(item);
    }

    this.persist = function(callback){
        if (typeof callback !== 'function'){
            callback = function(){}
        }
        
        Stargate.file.createFile(GamifiveSDK.getStargateBaseDir(), OFFLINE_DATA_FILENAME)
        .then(function(result){ 
            Utils.log("writing offline data", offlineInstance.data);
            Stargate.file.write(result.path, JSON.stringify(offlineInstance.data))
                .then(callback); 
        })
        .catch(function(err){
            Utils.error("error sg create offlineData file", err);
            callback();
        })
    }

    this.load = function(callback){

        var fileExistsPromise = Stargate.file.fileExists(GamifiveSDK.getStargateBaseDir() + OFFLINE_DATA_FILENAME);

        fileExistsPromise.then(function(boolExists){
            if (!boolExists){
                return Stargate.file.createFile(GamifiveSDK.getStargateBaseDir(), OFFLINE_DATA_FILENAME);
            } else {
                return Stargate.file.readFileAsJSON(GamifiveSDK.getStargateBaseDir() + OFFLINE_DATA_FILENAME).then(function(result){
                    var queue;
                    for (var key in offlineInstance.data.queues){
                        queue = offlineInstance.data.queues[key];
                        
                        if (!result.queues || !result.queues[key]) {
                            break;
                        }

                        while (result.queues[key].length > 0){
                            queue.unshift(result.queues[key].pop());   
                        }
                    }

                    if (typeof result.GaForGame != 'undefined'){
                        offlineInstance.data.GaForGame = result.GaForGame;
                    }

                    if (typeof result.GamifiveInfo != 'undefined'){
                        offlineInstance.data.GamifiveInfo = result.GamifiveInfo;
                    }

                    if (typeof callback === 'function'){
                        callback();
                    }
                })
                .catch(function(err){
                    console.error(err);
                    if (typeof callback === 'function'){
                        callback();
                    }
                });
            }
        });
        
    }

    this.getGamifiveInfo = function(contentId){
        var toReturn = offlineInstance.data.GamifiveInfo[contentId];
        return toReturn;
    }

    this.setGamifiveInfo = function(contentId, data){
        if (typeof 'undefined' === offlineInstance.data.GamifiveInfo[contentId]){
            offlineInstance.data.GamifiveInfo[contentId] = {};
        }
        offlineInstance.data.GamifiveInfo[contentId] = data;
    }

    this.setGaForGameJSON = function(contentId, data){
        if (typeof 'undefined' === offlineInstance.data.GaForGame[contentId]){
            offlineInstance.data.GaForGame[contentId] = {};
        }
        offlineInstance.data.GaForGame[contentId] = data;
    }

    this.getGaForGameJSON = function(contentId){
        var toReturn = offlineInstance.data.GaForGame[contentId];
        return toReturn;
    }
}