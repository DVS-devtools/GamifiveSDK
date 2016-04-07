var buildWeb;

var requiredComponents = [
    './components/WebSession',
    
];

for (var i=0; i<requiredComponents.length; i++){
    buildWeb = require(requiredComponents[i]);
}

module.exports = buildWeb;

