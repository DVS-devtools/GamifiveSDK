var build = {};

var Logger = require('../components/logger/logger.js');

build.Menu = require('../components/menu/menu.js');
build.User = require('../components/user/user.js');
build.FB = require('../components/fb/fb.js');
build.Session = require('../components/session/session.js');
build.GameInfo = require('../components/game_info/game_info.js');
build.getVersion = function(){
    return require('../version');
}

build.setLogLevel = function(level){
    Logger.init({level: level});
}

build.setLogEnabled = function(){
    Logger.init({enabled: true});
}

build.setLogDisabled = function(){
    Logger.init({enabled: false});
}

require('../retro/retro-interface.js')(build);

module.exports = build;

