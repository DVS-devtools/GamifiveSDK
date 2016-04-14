
var addRetroInterface = function(build){

    build.showMoreGamesButton = build.Menu.show;
    build.hideMoreGamesButton = build.Menu.hide;
    
    build.init = build.Session.init;
    build.startSession = build.Session.start;
    build.onStartSession = build.Session.onStart;
    build.endSession = build.Session.end;
    
    build.getConfig = function(){
        var toReturn = build.Session.getConfig();
        toReturn.user = build.User.getInfo();
        toReturn.game = build.GameInfo.getInfo();
        return toReturn;
    }
    
    build.saveUserData = build.User.saveData;
    build.loadUserData = build.User.loadData;
    build.clearUserData = build.User.clearData;

    build.share = build.FB.share;
    build.send = build.FB.send;
    
}

module.exports = addRetroInterface;