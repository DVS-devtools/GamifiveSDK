require('../../../bower_components/barney/modules/logger/logger.van.js');

var Logger = new BaseLogger();

Logger.init({ enabled: true });

module.exports = Logger;