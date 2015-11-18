<h1>GamifiveSDK 0.4</h1>
<p>This is the how-to for game developers for integrating GamifiveSDK into their games.</p>

<b>Note:</b> the SDK was previously called GamefiveSDK, now it has been aliased as GamifiveSDK so both names can be used.

<h1>Instructions</h1>

<h2>1) Including GamifiveSDK</h2>
Include the minified sdk within a SCRIPT tag with id <i>'gfsdk'</i>, inside HEAD tag of your HTML code game:

```html
<script id="gfsdk" src="http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk.min.js"></script>	
```

<h2>2) Initializing the SDK</h2>
    
The SDK can be initialized calling its <i>init</i> method with a <i>param</i> object as a configuration parameter. Here's a brief description of the accepted configuration variables:

<ul>
    <li>
        <i><b>debug</b></i> (boolean): toggles debug mode, if <i>true</i> a mock API is used instead of the original and log is enabled. If you're testing your game outside Gamifive's environment, you must set debug: true, otherwise the SDK will try to use a set of API that are not available into your environment. See https://github.com/BuongiornoMIP/GamifiveSDK/wiki/Debug-mode for further details;
    </li>
    <li>
        <i><b>lite</b></i> (boolean): toggles lite mode, if <i>true</i> a reduced set of functionalities is used, in particular the GameOver screen is not loaded. Lite mode is useful for integrating the SDK into level-based games, so that the game's flow won't get interrupted by the gameover screen. Normal (non-lite) mode, instead, is meant to be used for other kind of games, i.e. those that feature an endless gameplay experience;
    </li>
    <li> 
        <i><b>moreGamesButtonStyle</b></i> (object): defines the css style of the "more games" button. If present, the button will be displayed (you can pass an empty object for using the default style). If not present, the button won't be displayed.
    </li>
</ul>
<h3> Example </h3>

```javascript
GamifiveSDK.init({ 
	lite: false,
	debug: true,
	moreGamesButtonStyle: { } // shows more games button with default style
});
```
The <i>init</i> method will store the configuration parameters into the module and perform the operations needed for properly initializing the SDK (if you are not using the lite version). 

Please note that the <i>init</i> method will not create a new instance of <i>GamifiveSDK</i>, but it will just reset its configuration; in fact you can have only one instance of <i>GamifiveSDK</i> because it's implemented as a singleton. 

 
<h2>3) Starting a session</h2>
A session is a continued user activity like a game match. 
Ideally a session begins when the player starts playing a new game and his score is set to zero.

<h3> Lite Mode</h3>

For starting a session  in lite mode you just have to call <i>GamifiveSDK.startSession()</i>, after <i>GamifiveSDK.init()</i>.


<h3> Normal (non-lite) Mode</h3>

For starting a session you have to:
<ol>
	<li>move the start of the game into <i>GamifiveSDK.onStartSession()</i> method</li>
	<li>call <i>GamifiveSDK.startSession()</i> method to start the game</li>
</ol>

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
// (don't change it)
function startMatch(){ /* ... */ }

// onStartSession include startMatch() method
GamifiveSDK.onStartSession(function() {  
  startMatch();
});

// new method to call GamifiveSDK.startSession()
function playGame(){
  GamifiveSDK.startSession();
}
```

```html
<!-- button to start a game match -->
<button onclick="playGame()">START MATCH</button>
```

Here's a simple schema:
<img src="http://s2.motime.com/js/wl/webstore_html5game/gfsdk/manual/start_flow.png" width="100%" />

<h2>4) Ending a session</h2>
Ideally a session ends when the player cannot go on with his match and must play again from the beginning. 
Usually - but not necessarily - endSession occurs in the 'Game Over' state. 

<h3>Lite Mode</h3>

To end a session in lite mode, you have to:

<ol>
	<li>call <i>GamifiveSDK.endSession()</i> method.
		You should call it passing an object as parameter - this object can contain:
	   <ul> 
	       <li> an attribute <b>score</b>, which is the score realized by the player during the game session. This value must be a number (not string). </li>
    	   <li> an attribute <b>level</b>, which is the level reached by the player during the game session. This value must be a number and it will be saved for later use in the sdk configuration (you can retrieve it into <b>GamifiveSDK.getConfig().user.level</b>).
    	   </li>
    	   <li>
    	   No attributes at all: in this case the SDK will only save the game session (starting and ending time).
    	   </li>
	   </ul>
	</li>
</ol>

Here's a simple schema of the flow you have to follow for saving and retrieving the level reached by the player.
<img src="http://s2.motime.com/js/wl/webstore_html5game/gfsdk/manual/levelsaving.png" width="100%" />


		 
<h3>Normal (non-lite) Mode</h3>

To end a session in non-lite mode, you have to:

<ol>
	<li>call <i>GamifiveSDK.endSession()</i> method.
		You should call it passing an object as parameter - this object can contain:
	   <ul> 
    	   <li> an attribute <b>score</b>, which is the score realized by the player during the game session. This value must be a number (not string). 
    	   </li>
    	   <li>No attributes at all: in this case the SDK will only save the game session (starting and ending time).
    	   </li>
	   </ul>
	</li>
	<li>remove your game over screen - you have to remove your game over screen because the SDK also displays a game over screen. If you don't remove your game over screen, there will be two duplicate screens
	</li>
</ol>


```javascript
// call this method when a user ends a game session
var scoreGame = 7888;
GamifiveSDK.endSession({
	score: scoreGame
});
```

<h1>Other methods</h1>

<h2>showMoreGamesButton</h2>

Shows a built-in more games button with default graphics.

GamifiveSDK.showMoreGamesButton(); // displays the button 

<h2>goToHome</h2>
  
Redirects to Gamifive's Homepage. Call this function when your more games button is clicked (you don't need to call this function if you use the built-in more games button because it already calls this function by default).

GamifiveSDK.goToHome(); // performs a redirect to the homepage

<h2>getAvatar</h2>
You can get the user's avatar by calling <i>GamifiveSDK.getAvatar()</i>.

```javascript
var avatar = GamifiveSDK.getAvatar();
```

It returns an object containing two fields:
<ul>
	<li><b>src</b>: base64 of avatar</li>
	<li><b>name</b>: name of avatar file</li>
</ul>
We recommend using a <i>src</i> field for showing the avatar in the game.

<h2>getNickname</h2>
You can get the user's nickname by calling <i>GamifiveSDK.getNickname()</i>.

```javascript
var avatar = GamifiveSDK.getNickname();
```

It returns a string equal to the nickname of the user.


<h1>Migrating apps featuring older versions of the SDK to v0.4</h1>


<h2>Migrating app using v0.3 to v0.4 of the SDK</h2>

Apps featuring v0.3 of the SDK can be migrated to v0.4 by explicitly adding a call to the <i>Gamifive.init</i> method before using any of the module's features.

Previously, the <i>init</i> method was called implicitly, now it must be called by the game developer for correctly configuring the SDK by passing a config object with the desired parameters.

<h2>Migrating app using v0.1 to v0.4 of the SDK</h2>

Apps featuring v0.1 of the SDK can be migrated to v0.4 by explicitly adding a call to the <i>Gamifive.init</i> method before using any of the module's features.

Previously, the <i>init</i> method was called implicitly, now it must be called by the game developer for correctly configuring the SDK by passing a config object with the desired parameters.

Moreover, since the functionalities implemented in v0.1 correspond to the "lite" version of v0.4, you must declare <i>lite: true</i> in the configuration parameters passed to the <i>init</i> method. 

<h3> Example </h3>

```javascript
GamifiveSDK.init({ 
	lite: true
});
```

<b>Note:</b> when using the SDK in <i>lite</i> version you don't have to use <i>onStartSession</i> for starting your game, it is sufficient to call <i>startSession</i> for tracking the session's time and score.


<h1>Debug mode</h1>

Here is a brief description of the error and debug messages that are meant to be displayed in the JavaScript console of your browser when using GamifiveSDK in debug mode. 

We remind you that in order to use GamifiveSDK in debug mode, you have to call <i>Gamifive.init</i> with <i>debug: true</i> in the configuration argument.


<h2>Lite Mode</h2>

We remind you that in order to use GamifiveSDK in lite mode, you have to call <i>Gamifive.init</i> with <i>lite: true</i> in the configuration argument.


<h3>GamifiveSDK.init</h3>

No debug messages are displayed when calling <i>GamifiveSDK.init</i>.

<h3>GamifiveSDK.onStartSession</h3>

We remind you that you don't have to call <i>GamifiveSDK.onStartSession()</i> when using the lite mode of GamifiveSDK.

When calling <i>GamifiveSDK.onStartSession()</i> in lite mode, the following error message is displayed:

```javascript
    GamifiveSDK,ERROR,in lite mode, onStartSession must not be used
```

<h3>GamifiveSDK.startSession</h3>

If <i>GamifiveSDK.init</i> function was called before calling <i>GamifiveSDK.endSession</i>, then the following debug message is displayed: 

```javascript
    ["GamifiveSDK", "OK", "init has been called correctly"]
```

Otherwise, the following error message is displayed, specifying that the error was due to a missing or unsuccessful call to <i>init</i>.

```javascript
    GamifiveSDK,ERROR,init has not been called
```

<h3>GamifiveSDK.endSession</h3>

If <i>GamifiveSDK.startSession</i> function has been called before calling <i>GamifiveSDK.endSession</i>, then the following debug message is displayed: 

```javascript
    ["GamifiveSDK", "OK", "startSession has been called correctly"]
```

Otherwise, the following error message is displayed, specifying that the error was due to a missing or unsuccessful call to <i>GamifiveSDK.startSession</i>.

```javascript
    GamifiveSDK,ERROR,startSession has not been called
```

If the <i>score</i> was passed in the proper way, then the following debug message is displayed: 

```javascript
    ["GamifiveSDK", "OK", "score has been set correctly"]
```

Otherwise, the following error message is displayed:
```javascript
    GamifiveSDK,ERROR,missing score value
```


<h2>Normal (non-lite) mode</h2>

<h3>GamifiveSDK.init</h3>

No debug messages are displayed when calling <i>GamifiveSDK.init</i>.

<h3>GamifiveSDK.onStartSession</h3>

If the variable passed to <i>onStartSession</i> as an argument is a function, then the following debug message is displayed:
```javascript
     ["GamifiveSDK", "OK", "callback function has been set correctly"]
```

If such argument is not passed or it is not a function, then the following error message is displayed:
```javascript
    GamifiveSDK,ERROR,missing or illegal value for callback function
```

<h3>GamifiveSDK.startSession</h3>

If <i>init</i> and <i>onStartSession</i> were called before calling <i>GamifiveSDK.startSession</i>, then the SDK is now correctly configured to start a session and following debug messages are displayed: 

```javascript
    ["GamifiveSDK", "OK", "init has been called correctly"]
    ["GamifiveSDK", "OK", "onStartSession has been called correctly"]
```

Otherwise: 

if <i>init</i> was not called, the following error message is displayed:

```javascript
    GamifiveSDK,ERROR,init has not been called
```
if <i>onStartSession</i> was not called, the following error message is displayed:
```javascript
    GamifiveSDK,ERROR,onStartSession has not been called
```

<h3>GamifiveSDK.endSession</h3>

If the <i>startSession</i> function has been called before calling <i>GamifiveSDK.endSession</i>, then the following debug message is displayed: 

```javascript
    ["GamifiveSDK", "OK", "startSession has been called correctly"]
```

Otherwise, the following error message is displayed, specifying that the error was due to a missing or unsuccessful call to <i>startSession</i>.

```javascript
    GamifiveSDK,ERROR,startSession has not been called
```

If the <i>score</i> was passed in the proper way, then the following debug message is displayed: 

```javascript
    ["GamifiveSDK", "OK", "score has been set correctly"]
```

Otherwise, the following error message is displayed:
```javascript
    GamifiveSDK,ERROR,missing score value
```

