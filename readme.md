GamefiveSDK 0.1 - HOW-TO for Game Developers 
===========

The GamefiveSDK for JavaScript consists of a single JS file to be included in a SCRIPT element in the HEAD tag of your game HTML. 

The script element must have an ID with value 'gfsdk'. There is NO need to call any init function so <b>remove</b>b> any GamefiveSDK.init() in your code if you have one.

<b>To properly use the SDK read the JSDOC Reference from [0.1 GamifiveSDK Version Reference](https://github.com/BuongiornoMIP/GamifiveSDK/blob/0.1/manual/reference.md)</b>

The new interface is explained in detail inside the JSDOC Reference, any non-documented method is not meant to be used by the Game Developers for the moment.


### Use of the SDK in Production
You just include the minified sdk inside a script tag with id 'gfsdk'
```html
<script id="gfsdk" src="http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk-0.1.min.js"></script>	
```

# Follow this example to understand how to implement the sdk in your code, let's say your game has this two methods to start the game match called "playGame" and a method that is called when the player loses or wins the game called "endGame" which receives the score as parameter.

```javascript
function playGame() {
	//your custom play method 
	GamefiveSDK.startSession();		
}
function endGame(myscore) {
	// whatever you have to do on the end of the game
	// myscore is the current score for this game
	GamefiveSDK.endSession( {score: myscore} );		
}
```