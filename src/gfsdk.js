/**
* Gamifive Core
* @class Gfsdk
* @version 0.4
*/

var GamefiveSDK = new function() {

	var sessionData = new Object();

	/**
	* Init GamefiveSDK
	* @param {object} param - configuration
	* @param {boolean} [param.debug] - Set debug mode
	* @param {boolean} [param.log] - Enable/disable logging
	* @param {boolean} [param.lite] - If true SDK doesn't implement GameOver status 
	*/
	this.init = function(param){
		// get param
		Utils.copyProperties(param, sessionData);

		// enable/disable logging
		Utils.enableLog(!!sessionData.log);

		// get window.GamifiveInfo
		// DEBUG: call mock api
		Utils.copyProperties(window.GamifiveInfo, sessionData);

		// set facebook appId and init facebook
		FBConnector.setConfig('appId', sessionData.fbAppId);
		FBConnector.start();

		// log
		Utils.log("GamifiveSDK", "init", sessionData);
	}

};