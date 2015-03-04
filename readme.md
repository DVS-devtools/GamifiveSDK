<h1>GamefiveSDK 0.4</h1>
<p>This is the how-to for game developers for integrating GamefiveSDK into their games.</p>

<b>Note:</b> the SDK was previously called GamefiveSDK, now it has been aliased as GamifiveSDK so both names can be used.

<h2>Instructions</h2>

<h3>1) Including GamefiveSDK</h3>
Include the minified sdk within a SCRIPT tag with id <i>'gfsdk'</i>, inside HEAD tag of your HTML code game:

```html
<script id="gfsdk" src="http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk.min.js"></script>	
```

<h3>2) Initializing the SDK</h3>
    
The SDK can be initialized calling its <i>init</i> method with a <i>param</i> object as a configuration parameter. Here's a brief description of the accepted configuration variables:

<ul>
    <li>
        <i><b>debug</b></i> (boolean): toggles debug mode, if <i>true</i> a mock API is used instead of the original;
    </li>
    <li>
        <i><b>log</b></i> (boolean): enables or disables console logging;
    </li>
    <li>
        <i><b>lite</b></i> (boolean): toggles lite mode, if <i>true</i> a reduced set of functionalities is used, in particular the GameOver screen is not loaded;
    </li>
</ul>
<h4> Example </h4>

```javascript
GamefiveSDK.init({ 
	log: true,
	lite: false,
	debug: true
});
```
The <i>init</i> method will store the configuration parameters into an internal variable (<i>GamefiveSDK.config</i>) and perform the operations needed for properly initializing the SDK, i.e. connecting to Facebook (if you are not using the lite version). 

Please note that the <i>init</i> method will not create a new instance of <i>GamifiveSDK</i>, but it will just reset its configuration; in fact you can have only one instance of <i>GamifiveSDK</i> because it's implemented as a singleton. 

 
<h3>3) Starting a session</h3>
A session is a continued user activity like a game match. 
Ideally a session begins when the player starts playing a new game and his score is set to zero.

You have to:
<ol>
	<li>move the start of the game into <i>GamefiveSDK.onStartSession()</i> method</li>
	<li>call <i>GamefiveSDK.startSession()</i> method to start the game</li>
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
GamefiveSDK.onStartSession(function() {  
  startMatch();
});

// new method to call GamefiveSDK.startSession()
function playGame(){
  GamefiveSDK.startSession();
}
```

```html
<!-- button to start a game match -->
<button onclick="playGame()">START MATCH</button>
```

Here's a simple schema:
<img src="http://s2.motime.com/js/wl/webstore_html5game/gfsdk/manual/start_flow.png" width="100%" />

<h3>4) Ending a session</h3>
Ideally a session ends when the player cannot go on with his match and must play again from the beginning. 
Usually - but not necessarily - endSession occurs in the 'Game Over' state. 

To end a session, you have to:
<ol>
	<li>call <i>GamefiveSDK.endSession()</i> method.
		You should call it with an object parameter including the following fields:
		 <ul>
		  <li><b>score</b>: the score realized by the player during the game session</li>
		 </ul>
	</li>
	<li>remove your game over screen - you have to remove your game over screen because the SDK also displays a game over screen. If you don't remove your game over screen, there will be two duplicate screens
	</li>
</ol>


```javascript
// call this method when a user ends a game session
var scoreGame = 7888;
GamefiveSDK.endSession({
	score: scoreGame
});
```

<h2>Other methods</h2>

<h3>getAvatar</h3>
You can get the user's avatar by calling <i>GamefiveSDK.getAvatar()</i>.

```javascript
var avatar = GamefiveSDK.getAvatar();
```

It returns an object containing two fields:
<ul>
	<li><b>src</b>: base64 of avatar</li>
	<li><b>name</b>: name of avatar file</li>
</ul>
We recommend using a <i>src</i> field for showing the avatar in the game.

<h3>getNickname</h3>
You can get the user's nickname by calling <i>GamefiveSDK.getNickname()</i>.

```javascript
var avatar = GamefiveSDK.getNickname();
```

It returns a string equal to the nickname of the user.


<h2>Migrating apps featuring older versions of the SDK to v0.4</h2>


<h3>Migrating app using v0.3 to v0.4 of the SDK</h3>

Apps featuring v0.3 of the SDK can be migrated to v0.4 by explicitly adding a call to the <i>Gamefive.init</i> method before using any of the module's features.

Previously, the <i>init</i> method was called implicitly, now it must be called by the game developer for correctly configuring the SDK by passing a config object with the desired parameters.

<h3>Migrating app using v0.1 to v0.4 of the SDK</h3>

Apps featuring v0.1 of the SDK can be migrated to v0.4 by explicitly adding a call to the <i>Gamefive.init</i> method before using any of the module's features.

Previously, the <i>init</i> method was called implicitly, now it must be called by the game developer for correctly configuring the SDK by passing a config object with the desired parameters.

Moreover, since the functionalities implemented in v0.1 correspond to the "lite" version of v0.4, you must declare <i>lite: true</i> in the configuration parameters passed to the <i>init</i> method. 

<h4> Example </h4>

```javascript
GamefiveSDK.init({ 
	lite: true
});
```

Note: you don't have to use <i>onStartSession</i> for starting your game, it is sufficient to call <i>startSession</i> for tracking the session's time and score.


