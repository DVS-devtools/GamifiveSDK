/**
* Gameover.js
* @class Gameover
* @version 0.4
*/

var GameOverCore = new function() {

	/********************************************
	***** EXTERNAL METHODS FOR GAMEOVER TMPL ****
	********************************************/
 
	this.playAgain = function(){
		// call to sdk
		GamefiveSDK.startSession();
	} 

	this.invite = function(){
		// call to sdk
		GamefiveSDK.invite();

		var config = GamefiveSDK.getConfig();
		this.trackEvent("Challenge", "FbInvite", config.game.title + " + " + config.contentId);
	}

	this.g5challenge = function(userId){
		// call to sdk
		GamefiveSDK.challenge(userId);

	}

	this.otherGames = function(){
		// return true for link
		return true;
	}

	this.connect = function(){
		// call to sdk
		GamefiveSDK.connect();
	}

	this.addListeners = function(){
		Utils.log("Gameover", "addListeners");

		GamefiveSDK.onEvent('user_no_credits', function(e) {
			// show paywall
			Utils.show("paywall");
		});

		GamefiveSDK.onEvent('user_credits_updated', function(e) {
			// hide paywall, if present
			Utils.hide("paywall");

			// show message
			this.showMessage(e.title, e.message, e.success);
			
			// show updated credits feedback
			if(typeof(e.credits) != 'undefined'){
				var newCredits = parseInt(e.credits);
				var newMessage = "";
				var config = GamefiveSDK.getConfig();

				// zero credits
				if(newCredits == 0 && typeof(config.dictionary.matchLeftNone) != 'undefined'){
					newMessage = (config.dictionary.matchLeftNone).replace("%s", newCredits);	
					document.getElementById("credits-count").innerHTML = newMessage;	
				// one credit
				} else if(newCredits == 1 && typeof(config.dictionary.matchLeftSingular) != 'undefined'){
					newMessage = (config.dictionary.matchLeftSingular).replace("%s", newCredits);
					document.getElementById("credits-count").innerHTML = newMessage;
				// more credits
				} else if(newCredits > 1 && typeof(config.dictionary.matchLeftPlural) != 'undefined'){
					newMessage = (config.dictionary.matchLeftPlural).replace("%s", newCredits);
					document.getElementById("credits-count").innerHTML = newMessage;
				}
			}
		});

		GamefiveSDK.onEvent('challenge_completed', function(e) {
			if(e.success){
				// hide challenge button and show challenge feedback
				Utils.hide("challenge-ready-" + e.challenged_user_id);
				Utils.show("challenge-completed-" + e.challenged_user_id);
				// hide challenged name and show challenge feedback
				Utils.hide("name-ready-" + e.challenged_user_id);
				Utils.show("name-completed-" + e.challenged_user_id);
			} else {
				// show message
				this.showMessage(e.title, e.message, false);
			}
		});

		GamefiveSDK.onEvent('mip_connect_success', function(e) {
			// hide modal, if present
			Utils.hide("fbconnect-calltoaction");
			// show message
			if(!!e && typeof(e.title)!="undefined" && typeof(e.success_message)!="undefined"){
				this.showMessage(e.title, e.success_message, true);
			}
			// remove key from localstorage
			if(!!window.localStorage.getItem("_gameoverOpenFbModal_")){
				localStorage.removeItem("_gameoverOpenFbModal_");
			}
		});

		GamefiveSDK.onEvent('mip_connect_error', function(e) {
			// hide modal, if present
			Utils.hide("fbconnect-calltoaction");
			// show message
			if(!!e && typeof(e.title)!="undefined" && typeof(e.error_message)!="undefined"){
				this.showMessage(e.title, e.error_message, false);
			}
		});

		GamefiveSDK.onEvent('fb_connect_show', function(e){
			// show modal, if present
			Utils.show("fbconnect-calltoaction");
		});
	}

	this.trackEvent = function(category, action, label, properties){
		var config = GamefiveSDK.getConfig();
		if(!config.debug){
			GameAnalytics.trackEvent(category, action, label, properties);
		} else {
			Utils.log("GameAnalytics", "trackEvent", category, action, label, properties);
		}
	}

	this.showMessage = function(title, message, success){
		Utils.log("Gameover", "showMessage", title, message, success);

		// fill message
		document.getElementById("message-title").innerHTML = title;
		document.getElementById("message-text").innerHTML = message;
		// show message
		Utils.show("messages");
		// add right class
		if(success) {
			// add success class
			document.getElementById("messages").className += " success";
		} else {
			// add error class
			document.getElementById("messages").className += " error";
		}
	} 

	this.closeMessage = function(){
		Utils.log("Gameover", "closeMessage");

		// hide message
		Utils.hide("messages");
		// remove error and success classes
		document.getElementById("messages").className = document.getElementById("messages").className.replace(/\berror\b/,'');
		document.getElementById("messages").className = document.getElementById("messages").className.replace(/\bsuccess\b/,'');
	}

}