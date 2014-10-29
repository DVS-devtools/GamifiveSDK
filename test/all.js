QUnit.test("the base function exists", function() {
	ok(GamefiveSDK);
	var testGamefiveSDK = new GamefiveSDK();
	ok(testGamefiveSDK);
});

QUnit.test("init phase works correctly", function() {
	var testGamefiveSDK = new GamefiveSDK();
	var sessionData = testGamefiveSDK.status();
	ok(sessionData.userId);
	ok(sessionData.label);
	ok(sessionData.appId);
	ok(sessionData.fbAppId);
});





/*
QUnit.asyncTest("GameSession.submitWord checks anagram correctly", function() {
  var game = bonzatest();
  game.bind('game/start', function() {
	  var v1 = game.submitWord('absx');
	  ok(v5, 'abandonments');
	  QUnit.start();
  });
});


QUnit.asyncTest("Leaderboard test", function() {
	//var game = bonzatest();
	var game = new GameSession();
	Leaderboard.clear();
	var Things = ['a','ab','aba','aban','aband','abando','abandon','abandonm','abandonme','abandonmen','abandonment','abandonments']
	var iterations = 0;
	
	game.bind('game/start', function() {
	  	game.leaderboard.bind('leaderboard/score', function(e) {

	  		if (iterations >= Things.length) {

			  	equal(game.leaderboard.getScoreAtPosition(0) , 12);
				equal(game.leaderboard.getScoreAtPosition(11), null);
				equal(game.leaderboard.getScoreAtPosition(9) , 3);

				equal(game.leaderboard.getWordEntryAtPosition(0) , 'abandonments');
				equal(game.leaderboard.getWordEntryAtPosition(11) , null);
				equal(game.leaderboard.getWordEntryAtPosition(9) , 'aba');
					
				QUnit.start();	
	  			
	  		}
	  		else {
	  			iterations++;
	  			game.submitWord(Things[iterations]);
	  		}

	  	});

  		game.submitWord(Things[0]);

  	})
});

*/