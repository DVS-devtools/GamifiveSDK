var build = {};

build.Menu = require('../components/menu/menu.js');
build.User = require('../components/user/user.js');
build.FB = require('../components/fb/fb.js');
build.Session = require('../components/session/session.js');

require('../retro/retro-interface.js')(build);

module.exports = build;

