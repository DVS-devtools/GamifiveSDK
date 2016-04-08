var build;

var requiredComponents = [
    '../components/session/debug_session.js',
    '../components/menu/debug_menu.js',
    '../components/user/debug_user.js',
    '../components/fb/debug_fb.js'
];

var requiredComponent;
for (var i=0; i<requiredComponents.length; i++){
    requiredComponent = require(requiredComponents[i]);

    for (var key in requiredComponent){
        if (requiredComponent.hasOwnProperty(key)){
            build[key] = requiredComponent[key];
        }
    }
}

module.exports = build;
