<h1>GamefiveSDK 0.3</h1>
<p>This is the how-to for Game Developers, you have to follow all steps to install and use GamifiveSDK.</p>

<h2>Instructions</h2>

<h3>1) Include GamefiveSDK</h3>
Include the minified sdk with a SCRIPT tag with id 'gfsdk', inside HEAD tag of your HTML code game:

```html
<script id="gfsdk" src="http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk-0.3.min.js"></script>	
```

<h3>2) Start a session</h3>
A session is a continued user activity like a game match. 
Ideally a session starts when the player starts playing from the beginning and his score is set to zero.

You have to move the start of the game into <i>GamefiveSDK.onStartSession()</i> method and call <i>GamefiveSDK.startSession()</i> method to start the game.
Here's an example:

<b>Before, without GamifiveSDK</b>
```javascript
// your method to start a game match
function startMatch(){ /* ... */ }
```
```html
<!-- button to start a game match -->
<button onclick="startMatch()">START MATCH</button>
```

<b>After, with GamifiveSDK</b>
```javascript
// your method to start a game match
function startMatch(){ /* ... */ }

// onStartSession include startMatch() method
GamefiveSDK.onStartSession(function() {  
  startMatch();
});

// new method to call GamefiveSDK.startSession()
function playGame(){
  GamefiveSDK.startSession();
}
```
```html
<button onclick="playGame()">START MATCH</button>
```

<h3>3) End a session</h3>
Ideally a session ends when the player cannot continue his match and must play again from the beginning. 
Usually endSession corresponds to the 'Game Over' state. 

To end a session, you can call GamefiveSDK.endSession() method.
It should end with the score of that session.

```javascript
// call this method when a user end a game match
// score must be a float or integer value
GamefiveSDK.endSession(score);
```


<!--
GamefiveSDK 0.3 - HOW-TO for Game Developers 
===========

The GamefiveSDK for JavaScript consists of a single JS file to be included in a SCRIPT element in the HEAD tag of your game HTML. 

The script element must have an ID with value 'gfsdk'. There is no need to call any init function so strip away any GamefiveSDK.init() call you'll have an error otherwise.

<b>To properly use the SDK read the JSDOC Reference from [our CDN](http://s.motime.com/js/wl/webstore_html5game/gfsdk/manual/GamefiveSDK.html)</b>

The new interface is explained in detail inside the JSDOC Reference, any non-documented method is not meant to be used by the Game Developers for the moment.


### Use of the SDK in Production (will actually work only on Gamifive servers)
You just include the minified sdk inside a script tag with id 'gfsdk'
```html
<script id="gfsdk" src="http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk-0.3.min.js"></script>	
```

### Debug the SDK inside your game in development environment
You need a web server to test the SDK inside your game, you can use any but here's some examples:
- [SimpleHTTPServer](http://www.pythonforbeginners.com/modules-in-python/how-to-use-simplehttpserver/)
- [Nginx](http://nginx.org/it/)
- [Apache HTTP Server](http://httpd.apache.org/)

In order to switch on the debug mode you have to add the parameter the 'debug=true' to the SDK URL.

You can also use the non-minified version of the SDK (just strip the '.min' from the SDK URL) if you need a better understanding of the code.
```html
<script id="gfsdk" src="http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk-0.3.js?debug=true"></script>
```
While in DEBUG the SDK will search for some JSON files, those files are located in this repository inside the [demo](https://github.com/Bolza/GamifiveSDK/tree/master/demo) directory.

Here you can find a simple demo page and a folder [mock01](https://github.com/Bolza/GamifiveSDK/tree/master/demo/mock01) with JSON responses that you can eventually edit to simulate different situations.

The SDK will search for these files inside the root of your game, the same folder in which your index.html file is located and from which the SDK is requested. So you have to copy the 'mock01' folder inside your project root.

```
- Game_Root
-- mock01
-- index.html //file that includes the SDK
```
-->

