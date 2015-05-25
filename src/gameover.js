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

	var likeBtnId = "gameOverLikeBtn";
	var heartIconId = "heartIcon";

	var apiKey = "abcdef1234567890";
	var MOA_API_FAVORITES_SET = "http://www2.giochissimo.it/v01/favorites.set";
	var MOA_API_FAVORITES_DELETE = "http://www2.giochissimo.it/v01/favorites.delete";
	var MOA_API_FAVORITES_GET = "http://www2.giochissimo.it/v01/favorites.get";
	var MOA_API_RECOMMEND_EVENT = "http://www2.giochissimo.it/mip-ingestion/v01/recommend/event/:EVENT";
	var UPDATE_CREDITS = "http://www2.giochissimo.it/v01/mipuser.updatecredits";

	this.invite = function(){
		// call to sdk
		GamefiveSDK.invite();

		var config = GamefiveSDK.getConfig();
		var properties = {
			valuable_cd: 'No',
			action_cd: 'Yes'
		}
		this.trackEvent("Challenge", "FbInvite", config.game.title + " + " + config.contentId, properties);
		newtonTrackEvent({ 
			category: 'Challenge', 
			action: 'FbInvite', 
			label: config.game.title + " + " + config.contentId, 
			valuable_cd: 'No', 
			action_cd: 'Yes' 
		});
	}

	var updateCredits = function(callback){
		var defaultCallback = function(response){
			Utils.log("GamifiveSDK", "updateCredits", response);
			GamifiveSDK.throwEvent('user_credits_updated', response);
		}
		Utils.xhr('GET', UPDATE_CREDITS, defaultCallback);
	}

	this.share = function(url){

		var callback = function(resp){
			if (resp.error_code != undefined){
				Utils.log("GamifiveSDK", "share", "abort", resp);
			}
			else {
				Utils.log("GamifiveSDK", "share", "success", resp);
				updateCredits();
			}
		}
		// call to sdk
		GamefiveSDK.share(url, callback);

		// tracking
		var config = GamefiveSDK.getConfig();
		this.trackEvent("Challenge", "FbScore", config.game.title + " + " + config.contentId, { valuable_cd: 'No', action_cd: 'Yes' });
		newtonTrackEvent({ 
			category: 'Challenge', 
			action: 'FbScore', 
			label: config.game.title + " + " + config.contentId, 
			valuable_cd: 'No', 
			action_cd: 'Yes' 
		});
	}

	this.send = function(url){

		var callback = function(resp){
			if (resp && resp.success && resp.success === true){
				Utils.log("GamifiveSDK", "send", "success", resp);
				updateCredits();
			}
			else {
				Utils.log("GamifiveSDK", "send", "abort", resp);
			}
		}
		// call to sdk
		GamefiveSDK.send(url, callback);

		// tracking
		var config = GamefiveSDK.getConfig();
		this.trackEvent("Challenge", "FbSend", config.game.title + " + " + config.contentId, { valuable_cd: 'No', action_cd: 'Yes' });
		newtonTrackEvent({ 
			category: 'Challenge', 
			action: 'FbSend', 
			label: config.game.title + " + " + config.contentId, 
			valuable_cd: 'No', 
			action_cd: 'Yes' 
		});
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
		var _this = this;

		Utils.log("Gameover", "addListeners");

		GamefiveSDK.onEvent('user_no_credits', function(e) {
			// show paywall
			Utils.show("paywall");
		});

		GamefiveSDK.onEvent('user_credits_updated', function(e) {
			// hide paywall, if present
			Utils.hide("paywall");

			// show message
			_this.showMessage(e.title, e.message, e.success);
			
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
				_this.showMessage(e.title, e.message, false);
			}
		});

		GamefiveSDK.onEvent('mip_connect_success', function(e) {
			// hide modal, if present
			Utils.hide("fbconnect-calltoaction");
			// show message
			if(!!e && typeof(e.title)!="undefined" && typeof(e.success_message)!="undefined"){
				_this.showMessage(e.title, e.success_message, true);
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
				_this.showMessage(e.title, e.error_message, false);
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

	var createQuery = function(params){
		var query = []
		for (var key in params){
			query.push(key + '=' + params[key]);
		}
		return '?' + query.join('&')
	}

	this.switchHeart = function(value){
		var btn = document.getElementById(likeBtnId);
		var ico = document.getElementById(heartIconId);

		if (value){
			if (btn.className.indexOf('heart-active') < 0){				
				btn.className += ' heart-active ';
			}
			if (ico.className.indexOf('ico-red') < 0){				
				ico.className += ' ico-red ';
			}
		}
		else {
			btn.className = btn.className.replace('heart-active', '');
			ico.className = ico.className.replace('ico-red', '');
		}
	}

	this.like = function(contentId){
		// Favorites

		var _this = this;

		var favorites_params = {	
			"apikey": apiKey,
			"content_id": contentId
		}

		var favUrl = MOA_API_FAVORITES_SET;
		favUrl += createQuery(favorites_params);

		Utils.xhr('POST', favUrl, function(resp, xhr){
			// heart icon becomes red 
			_this.switchHeart(true);

			// add to likesList
			likesList[contentId] = true;

			// track add to favorites
			_this.trackEvent({ 
				category: 'Favorites', 
				action: 'Add', 
				label: '<Page>', 
				valuable_cd: 'No', 
				action_cd: 'Yes' 
			});

			newtonTrackEvent({ 
				category: 'Favorites', 
				action: 'Add', 
				label: '<Page>', 
				valuable_cd: 'No', 
				action_cd: 'Yes' 
			});

		});
	}

	this.dislike = function(contentId){

		// Favorites
		var _this = this;

		var favorites_params = {	
			"apikey": apiKey,
			"content_id": contentId
		}

		var favUrl = MOA_API_FAVORITES_DELETE;
		favUrl += createQuery(favorites_params);

		Utils.xhr('POST', favUrl, function(resp, xhr){
			// heart icon switched off
			_this.switchHeart(false);

			// remove from likesList
			delete likesList[contentId];

			// track remove from favorites
			_this.trackEvent({ 
				category: 'Favorites', 
				action: 'Remove', 
				label: '<Page>', 
				valuable_cd: 'No', 
				action_cd: 'Yes' 
			});

			newtonTrackEvent({ 
				category: 'Favorites', 
				action: 'Remove', 
				label: '<Page>', 
				valuable_cd: 'No', 
				action_cd: 'Yes' 
			});
		});
	}

	this.toggleLike = function (){
		var icon = document.getElementById(heartIconId);
		
		var favorites_params = {	
			"apikey": apiKey
		}

		var url = MOA_API_FAVORITES_GET;
		url += createQuery(favorites_params);

		if (!this.getStatus(window.contentId)){
			this.like(window.contentId);
		}
		else {
			this.dislike(window.contentId);
		}
	}

	var likesList = undefined;

	this.getStatus = function(contentId){
		return !!likesList[contentId];
	}

	this.setLikesList = function(callback){
		Utils.xhr('GET', url, function(resp, xhr){
			likesList = {}
			for (var index = 0; index < resp.length; index++){
				var item = resp[index];
				likesList[item.contentId] = true;
			}
			if (callback && typeof callback == 'function'){
				callback();
			}
		});
	};

	this.getLikesList = function(){
		return likesList;
	};

	this.initializeLike = function(){
		var _this = this;

		var doInitialize = function (){
			if (_this.getStatus(window.contentId)){
				_this.switchHeart(true);
			}else {
				_this.switchHeart(false);
			}
		}

		if (likesList === undefined){
			_this.setLikesList(doInitialize);
		}
		else {	
			doInitialize();
		}
	}


	// CLICK RELATED
	this.clickRelated = function(index, type){

		var properties = {
			valuable_cd: 'No',
			action_cd: 'Yes',
		};

		var label = index;

		this.trackEvent('GameOverRelated', type, label, properties);
		newtonTrackEvent({ 
			category: 'GameOverRelated', 
			action: type, 
			label: label, 
			valuable_cd: 'No', 
			action_cd: 'Yes' 
		});
	};

}