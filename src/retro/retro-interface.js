
var addRetroInterface = function(build){

    if (!!build.Menu){
        build.showMoreGamesButton = build.Menu.show;
        build.hideMoreGamesButton = build.Menu.hide;
    }

    if (!!build.Session){
        build.init = build.Session.init;
        build.startSession = build.Session.start;
        build.onStartSession = build.Session.onStart;
        build.endSession = build.Session.end;
        build.getConfig = function(){
            var toReturn = Session.getConfig();
            toReturn.user = User.getInfo();
            toReturn.game = GameInfo.getInfo();
            return toReturn;
        }
    }

    if (!!build.User){
        build.saveUserData = build.User.saveData;
        build.loadUserData = build.User.loadData;
        build.clearUserData = build.User.clearData;
    }

    if (!!build.FB){
        build.share = build.FB.share;
        build.send = build.FB.send;
    }
}

module.exports = addRetroInterface;