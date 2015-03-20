'use strict';

(function () {
    describe('GamifiveSDK', function () {

    	var $httpBackend;
 
		beforeEach(inject(function(_$httpBackend_) {
		    $httpBackend = _$httpBackend_;
		    $httpBackend.when('GET', '*/gamifiveinfo')
		      .respond(APIConfigMockResponse);
		}));

    	afterEach(function() {
    		// reset the configuration (this is the only way to reset the status of the module)
		  	GamifiveSDK.reset();
      		expect(GamifiveSDK.getConfig()).toEqual({});
		});
      	
      	describe('init', function(){

	      	it('if param is not empty, then each value passed into param is stored into GamifiveSDK.config', function(){
	      		var param = { 
	      			a: true,
	      			b: false,
	      			c: 'c',
	      			d: 1,
	      			e: { f: 1.0} 
	      		};

	      		runs(function(){
	      			GamifiveSDK.init(param);
	      		});
	      		
	      		waitsFor(function() {
	      			// Wait for api to return value
					var config = GamifiveSDK.getConfig();
					return !!config && !!config.contentId;
			    }, 'wait contentId', 3000);

	      		runs(function(){
	      			// check that every value contained in param is also into config
	      			for (var key in param){
		      			expect(GamifiveSDK.getConfig()[key]).toEqual(param[key]);
		      		}
	      		});
	      	});

	      	it('if log is true, then console.log is called', function(){
	      		runs(function(){
	      			spyOn(console, 'log');
	      			GamifiveSDK.init({log: true});
	      		});
	      		
	      		waitsFor(function() {
	      			// Wait for api to return value
					var config = GamifiveSDK.getConfig();
					return !!config && !!config.contentId;
			    }, 'wait contentId', 3000);

	      		runs(function(){
	      			expect(console.log).toHaveBeenCalled();
	      		});
	      	});

	      	it('if log is not true, then console.log is not called', function(){
	      		runs(function(){
	      			spyOn(console, 'log');
	      			GamifiveSDK.init({log: false});
	      		});
	      		
	      		waitsFor(function() {
	      			// Wait for api to return value
					var config = GamifiveSDK.getConfig();
					return !!config && !!config.contentId;
			    }, 'wait contentId', 3000);

	      		runs(function(){
	      			expect(console.log).not.toHaveBeenCalled();
	      		});
	      	});

	      	it('if debug is false, then config is taken from window.GamifiveInfo', function(){
	      		var param = { 
	      			debug: false
	      		};

	      		runs(function(){
	      			GamifiveSDK.init(param);
	      		});
	      		
	      		var config; 

	      		waitsFor(function() {
	      			// Wait for api to return value
					config = GamifiveSDK.getConfig();
					return !!config && !!config.contentId;
			    }, 'wait contentId', 3000);

	      		runs(function(){
	      			for (var key in window.GamifiveInfo){
		      			expect(config[key]).toEqual(window.GamifiveInfo[key]);
		      		}
	      		});
	      	});

	      	it('if debug is true, then config is taken from API', function(){
	      		
	      	});

	      	it('if lite is true, FBConnector is not initialized and GameOver listeners are not added', function(){
	      		var param = { 
	      			lite: true
	      		};

	      		runs(function(){
	      			spyOn(FBConnector, 'setConfig');
	      			spyOn(FBConnector, 'start');
	      			spyOn(GameOverCore, 'addListeners');
	      			spyOn(GamifiveSDK, 'controlFbConnected');
	      			GamifiveSDK.init(param);
	      		});
	      		
	      		var config; 

	      		waitsFor(function() {
	      			// Wait for api to return value
					config = GamifiveSDK.getConfig();
					return !!config && !!config.contentId;
			    }, 'wait contentId', 3000);

	      		runs(function(){
	      			expect(FBConnector.setConfig).not.toHaveBeenCalled();
	      			expect(FBConnector.start).not.toHaveBeenCalled();
	      			expect(GameOverCore.addListeners).not.toHaveBeenCalled();
					expect(GamefiveSDK.controlFbConnected).not.toHaveBeenCalled();
	      		});
	      	});

	      	it('if lite is false, FBConnector is initialized and GameOver listeners are added', function(){
	      		var param = { 
	      			lite: false
	      		};

	      		runs(function(){
	      			spyOn(FBConnector, 'setConfig');
	      			spyOn(FBConnector, 'start');
	      			spyOn(GameOverCore, 'addListeners');
	      			spyOn(GamifiveSDK, 'controlFbConnected');
	      			GamifiveSDK.init(param);
	      		});
	      		
	      		var config; 

	      		waitsFor(function() {
	      			// Wait for api to return value
					config = GamifiveSDK.getConfig();
					return !!config && !!config.contentId;
			    }, 'wait contentId', 3000);

	      		runs(function(){
	      			expect(FBConnector.setConfig).toHaveBeenCalled();
	      			expect(FBConnector.start).toHaveBeenCalled();
	      			expect(GameOverCore.addListeners).toHaveBeenCalled();
					expect(GamefiveSDK.controlFbConnected).toHaveBeenCalled();
	      		});
	      	});
	      	
      	});




    });
})();
