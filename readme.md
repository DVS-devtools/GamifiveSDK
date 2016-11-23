[![Build Status](https://travis-ci.org/BuongiornoMIP/GamifiveSDK.svg?branch=master)](https://travis-ci.org/BuongiornoMIP/GamifiveSDK)

[![Coverage Status](https://coveralls.io/repos/github/BuongiornoMIP/GamifiveSDK/badge.svg?branch=master)](https://coveralls.io/github/BuongiornoMIP/GamifiveSDK?branch=master)

<h1>GamifiveSDK 2.x.x</h1>
<p>This is the how-to for game developers for integrating GamifiveSDK into their games.</p>

<b>Note:</b> the SDK was previously called GamefiveSDK, now it has been aliased as GamifiveSDK so both names can be used.

<h1>Instructions</h1>

<h2>1) Including GamifiveSDK</h2>

### Debug (use it while developing or to test the implementation on your own)
```html
<script src="static.newton.pm/js/v2.2.3/newton.min.js"></script> 
<script src="http://s.motime.com/js/wl/webstore_html5game/gfsdk/2.x.x/debug/gfsdk.js"></script>
```
(See https://github.com/BuongiornoMIP/GamifiveSDK/wiki/Debug-mode for further details;)

### Prod (before sending us the package remove newton and switch to the production build)
Include the minified sdk within a SCRIPT tag with id <i>'gfsdk'</i>, inside HEAD tag of your HTML code game before sending us the package:

```html
<script id="gfsdk" src="http://s.motime.com/js/wl/webstore_html5game/gfsdk/2.x.x/dist/gfsdk.min.js"></script>
```

<h2>2) Initializing the SDK</h2>
    
The SDK can be initialized calling its <i>init</i> method with a <i>param</i> object as a configuration parameter. Here's a brief description of the accepted configuration variables:

<ul>
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
	moreGamesButtonStyle: { } // shows more games button with default style
});
```
The <i>init</i> method will store the configuration parameters into the module and perform the operations needed for properly initializing the SDK (if you are not using the lite version). 

Please note that the <i>init</i> method will not create a new instance of <i>GamifiveSDK</i>, but it will just reset its configuration; in fact you can have only one instance of <i>GamifiveSDK</i> because it's implemented as a singleton. 

 
<h2>3) Starting a session</h2>
A session is a continued user activity like a game match. 
Ideally a session begins everytime the player starts playing a new game and his score is set to zero.

<h3> Lite Mode</h3>

For starting a session  in lite mode you just have to call <i>GamifiveSDK.startSession()</i>.


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

<h2>saveUserData</h2>
Saves an Object containing the player's progress.

```javascript
// the structure of this object is just an example
var playerProgress = { 
    level1: { 
        unlocked: true, 
        stars: 3
    }, 
    level2: {
        unlocked: false, 
        stars: 0
    } 
};
  
// saves the object containing the player's progress
GamifiveSDK.saveUserData(playerProgress); 
```

GamifiveSDK.saveUserData internally uses JSON.stringify and actually saves the object as a string, but this is an internal procedure and **you MUST pass an object**, not a JSON string, as a parameter to GamifiveSDK.saveUserData.


<h2>loadUserData</h2>  
Retrieves the JSON string containing the player's progress and returns it as a JavaScript Object.
This method make a call to our server and **must be called AFTER GamifiveSDK.init();**
  
```javascript
// returns an object containing the player's progress

GamifiveSDK.init();
var userProgressInGame = {};
GamifiveSDK.loadUserData(function(userProgressSaved){
    if(userProgressSaved){
        //else load userprogress in the game
        userProgressInGame = userProgressSaved;
    }
    //start the game with the userProgress loaded
});
```

<h2>clearUserData</h2>
Deletes the player's progress.

  
```javascript
// the previously saved progress is deleted
GamifiveSDK.clearUserData(); 
```

<h2>showMoreGamesButton</h2>

Shows a built-in more games button. If no parameters are passed, the button is created with default style, otherwise the object passed as parameter will be used as a custom style.

```javascript
// display the button with default style:
GamifiveSDK.showMoreGamesButton(); 

// display the button with custom style:
GamifiveSDK.showMoreGamesButton({left: '2px', height: '44px'}); 
```

<h2>hideMoreGamesButton</h2>

Hides the more games button (if it was previously shown).

```javascript
GamifiveSDK.hideMoreGamesButton(); 
```
<h2>goToHome</h2>
  
Redirects to Gamifive's Homepage. Call this function when your more games button is clicked.

```javascript
// perform a redirect to the homepage

GamifiveSDK.goToHome(); 
```

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

<h2>Lite Mode</h2>

We remind you that in order to use GamifiveSDK in lite mode, you have to call <i>Gamifive.init</i> with <i>lite: true</i> in the configuration argument.


<h3>GamifiveSDK.init</h3>


<h3>GamifiveSDK.onStartSession</h3>

Register a callback function any time a session start

GamifiveSDK.onStartSession(function yourFunction(){
    //do things everytime a session start
});

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

## Full implementation example
```javascript

GamifiveSDK.onStartSession(function(){
    // do somenthing everytime a session starts
});

// You can run this on body onload event or on document content load or as soon as you can
GamifiveSDK.init({ lite: true }); // could be an empty object: default lite = false

// your userData empty structure
var emptyStructure = {
    level1: { 
        unlocked: false, 
        stars: 0,
        score: 0
    }, 
    level2: {
        unlocked: false, 
        stars: 0,
        score: 0
    } 
}

var userProgressInGame = {};
GamifiveSDK.loadUserData(function(userProgressSaved){
    if(userProgressSaved){
        //else load userprogress in the game
        userProgressInGame = userProgressSaved;
    }
    //start the game with the userProgress loaded
});

GamifiveSDK.startSession();

// Persist user data when somenthing happens. Change in settings or end of the level
GamifiveSDK.saveUserData({ 
    level1: { 
        unlocked: true, 
        stars: 2,
        score: 300
    }, 
    level2: {
        unlocked: false, 
        stars: 0,
        score:0
    } 
});

GamifiveSDK.endSession({ score: 300, level: 1 });

```
# Set the debug environment

1. Include the debug SDK version in your index.html *do not forget to change debug with dist in the script tag before send the package*

### Debug (while testing in local)
```javascript
    <script src="static.newton.pm/js/v2.2.3/newton.min.js"></script> 
    <script src="http://s.motime.com/js/wl/webstore_html5game/gfsdk/2.x.x/debug/gfsdk.js"></script>
```

### Prod (Before sending us the package)
```javascript 
    <script src="http://s.motime.com/js/wl/webstore_html5game/gfsdk/2.x.x/dist/gfsdk.js"></script>
```

2. Serve statically the game folder with appsworld.gamifive-app.com as origin

For the second point you need:

### 2.1 Install NodeJS and NPM in your system.

- Mac Users can follow this guide: http://blog.teamtreehouse.com/install-node-js-npm-mac
- Windows Users can follow this one: http://blog.teamtreehouse.com/install-node-js-npm-windows
(Some other of billions guides on the web anyway will be ok)

### 2.2  Install http-server npm package globally

```javascript
    npm install http-server -g
```

### 2.3 Edit your hosts file

Add this line
```javascript
   127.0.0.1 local.appsworld.gamifive-app.com
```

into your hosts file

 ```javascript
/private/etc/hosts file (Mac)
C:\Windows\System32\drivers\etc\hosts (Windows)
```  


On Mac you can simply append this line at the end of the file in this way:
 ```javascript
sudo -i # Enter the password
sudo echo '127.0.0.1 local.appsworld.gamifive-app.com' >> /private/etc/hosts;
exit
```

(Guide to edit hosts file on any platform http://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/)

### 2.4 Serve the gamepath

Serve the gamepath in this way from the cmd line
```javascript
   http-server <myAwesomeGameFolder> -p 5050 -a local.appsworld.gamifive-app.com
```

Then open the browser to
```javascript
    http://local.appsworld.gamifive-app.com:5050/index.html
``` 

That's it! Now you can test your implementation of the SDK. 
Open a issue on github if you encounter any issues