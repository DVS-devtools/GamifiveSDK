var GamifiveSDK = new function(){

    var sdkInstance = this;

    this.registerComponent = function(component, callback){
        for (var key in component){
            if (component.hasOwnProperty(key)){
                this[key] = component[key];
            }
        }
    }

    this.registerComponents = function(components, callback){
        for (var i=0; i<components.length; i++){
            sdkInstance.registerComponent(components[i], callback);
        }
    }

    this.registerComponent(new function AbstractSession(){

        this.init = function(params){
            console.error('GamifiveSDK', 'Session', 'init', 'not implemented');
        }

        this.onStartSession = function(callback){
            console.error('GamifiveSDK', 'Session', 'onStartSession', 'not implemented');
        }

        this.startSession = function(){
            console.error('GamifiveSDK', 'Session', 'startSession', 'not implemented');
        }

        this.onPauseEnter = function(callback){
            console.error('GamifiveSDK', 'Session', 'onPauseEnter', 'not implemented');
        }

        this.onPauseExit = function(callback){
            console.error('GamifiveSDK', 'Session', 'onPauseExit', 'not implemented');
        }

        this.endSession = function(data){
            console.error('GamifiveSDK', 'Session', 'init', 'not implemented');
        }
    });


    this.registerComponent(new function AbstractMoreGamesButton(){

        this.showMoreGamesButton = function(style){
            console.error('GamifiveSDK', 'MoreGamesButton', 'showMoreGamesButton', 'not implemented');
        }

        this.hideMoreGamesButton = function(){
            console.error('GamifiveSDK', 'MoreGamesButton', 'hideMoreGamesButton', 'not implemented');
        }   
    });

    this.registerComponent(new function AbstractUser(){

        this.saveUserData = function(data, callback){
            console.error('GamifiveSDK', 'User', 'saveUserData', 'not implemented');
        }

        this.loadUserData = function(callback){
            console.error('GamifiveSDK', 'User', 'loadUserData', 'not implemented');
        }

        this.clearUserData = function(callback){
            console.error('GamifiveSDK', 'User', 'clearUserData', 'not implemented');
        }   
    });

    this.registerComponent(new function AbstractFacebook(){
        this.share = function(url, callback){
            console.error('GamifiveSDK', 'Facebook', 'share', 'not implemented');
        }

        this.send = function(url, callback){
            console.error('GamifiveSDK', 'Facebook', 'share', 'not implemented');
        }
    });

};

// old games backward-compatibility
var GamefiveSDK = GamifiveSDK;