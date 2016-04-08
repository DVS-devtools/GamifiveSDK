var build;

var requiredComponents = [
    '../components/session/web_session.js',
    '../components/menu/web_menu.js',
    '../components/user/web_user.js',
    '../components/fb/web_fb.js'
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

