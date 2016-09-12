var addRetroInterface = function(build){

    build.showMoreGamesButton = build.Menu.show;
    build.hideMoreGamesButton = build.Menu.hide;
    
    build.init = build.Session.init;
    build.startSession = build.Session.start;
    build.onStartSession = build.Session.onStart;
    build.endSession = build.Session.end;

    build.goToHome = build.Session.goToHome;
    
    build.getConfig = function(){
        var toReturn = build.Session.getConfig();
        toReturn.user = build.User.getInfo();
        toReturn.game = build.GameInfo.getInfo();
        if (process.env.NODE_ENV !== "production") {
            toReturn._vhost = require('../components/vhost/vhost');
        }
        return toReturn;
    }
    
    build.saveUserData = build.User.saveData;
    build.loadUserData = build.User.loadData;
    build.clearUserData = build.User.clearData;

    build.share = build.FB.share;
    build.send = build.FB.send;
    if(!window.GameOverCore){
        window.GameOverCore = {
            playAgain:function(){
                build.startSession();
            },
            goToPaywall:function(){
                var _url = window.location.href;
                _url += (_url.split('?')[1] ? '&':'?') + "show_paywall=1";		
		        window.location.href=_url;
            },
            toggleLike:function(){                
                build.User.toggleLike.apply(build.User, arguments);
            },
            share:function(){
                build.share.apply(null, arguments);
            }
        } 
    }
    
}

module.exports = addRetroInterface;