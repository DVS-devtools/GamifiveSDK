module.exports = function(){
        this.checkConnection = function(){
            return { networkState: "wifi", type: "online" }
        };

        this.isHybrid = function(){
            return false;
        };

        this.file = {
            fileExists:function(){
                return Promise.resolve(true); 
            },
            readFileAsJSON:function(){
                return Promise.resolve({mockKey:"mockValue"});
            },
            write:function(){},
            BASE_DIR: "file:///appid/applicationStorageDirectory/"
        };

        this.game = {
            BASE_DIR:"file:///appid/applicationStorageDirectory/"
        };

        
        this.initialize = function(){
            return Promise.resolve(true);
        };

        this.goToLocalIndex = function(){
            return true;
        };

        this.goToWebIndex = function(){
            return true;
        }

        this.getWebappOrigin = function(){
            return 'http://www.gameasy.com';
        };

        this.getCountryCode = function(){
            return 'ww-it';
        };

        this.addListener = function(fn){

        }
};