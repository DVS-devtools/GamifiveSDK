
var GamifiveSDKOffline = new function(){

    var Utils = GamifiveSDKUtils;
    var offlineInstance = this;
    var OFFLINE_DATA_FILENAME = 'offlineData.json';

    this.data = {
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
        
        Stargate.file.createFile(Stargate.game.GAMES_DIR, OFFLINE_DATA_FILENAME)
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

    this.load = function(){
        Stargate.file.readFileAsJSON(Stargate.game.GAMES_DIR + OFFLINE_DATA_FILENAME)
            .then(function(result){
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
            })
            .catch(function(err){
                // file does not exist, do nothing
            });
    }

}