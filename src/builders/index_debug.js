var build;

var requiredComponents = [
    '../components/session/debug_session.js',
    '../components/menu/debug_menu.js',
    '../components/user/debug_user.js',
    '../components/fb/debug_fb.js'
];

var requiredModule;
for (var i=0; i<requiredComponents.length; i++){
    requiredModule = require(requiredComponents[i]);

    for (var key in requiredModule){
        if (requiredModule.hasOwnProperty(key)){
            build[key] = requiredModule[key];
        }
    }
}

module.exports = build;

