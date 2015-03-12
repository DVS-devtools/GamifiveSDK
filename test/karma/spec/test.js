/*global describe, it */
'use strict';

(function () {
    describe('GamifiveSDK', function () {

      	it('is defined', function(){
      		expect(GamifiveSDK).toBeDefined();
      	});

      	it('contentId is initially undefined', function(){
      		expect(GamifiveSDK.contentId).toBeUndefined();
      	});


      	describe('init', function(){

	      	it('after calling init, contentId is defined', function(){
	      		runs(function(){
	      			GamifiveSDK.init({debug:true});
	      		});

	      		waitsFor(function() {
					var config = GamifiveSDK.getConfig();
					return !!config && config.contentId;
			    }, "configId ", 1000); 
	      		
	      		runs(function(){
	      			expect(GamifiveSDK.getConfig().contentId).toBeDefined();
	      		});
	      	});
      	});

      	describe('onStartSession', function(){

	      	it('before calling onStartSession, startCallback is undefined', function(){
	      		expect(GamifiveSDK.getConfig().startCallback).toBeUndefined();
	      	});

	      	it('after calling onStartSession, startCallback is defined', function(){
	  			GamifiveSDK.onStartSession(function(){ console.log('playing'); });
	      		expect(GamifiveSDK.getConfig().startCallback).toBeDefined();
	      	});

      	});


    });
})();
