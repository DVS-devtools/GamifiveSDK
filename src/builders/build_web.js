var build = {};

build.Menu = require('../components/menu/menu.js');
build.User = require('../components/user/user.js');
build.FB = require('../components/fb/fb.js');
build.Session = require('../components/session/session.js');
build.GameInfo = require('../components/game_info/game_info.js');

require('../retro/retro-interface.js')(build);

module.exports = build;

