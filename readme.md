<h1>GamefiveSDK 0.4</h1>
<p>This is the how-to for Game Developers, you have to follow all steps to install and use GamifiveSDK.</p>

<h2>Instructions</h2>

<h3>1) Include GamefiveSDK</h3>
Include the minified sdk within a SCRIPT tag with id <i>'gfsdk'</i>, inside HEAD tag of your HTML code game:

```html
<script id="gfsdk" src="http://s.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk-0.4.js"></script>	
```

<h3>2) Start a session</h3>
A session is a continued user activity like a game match. 
Ideally a session starts when the player starts playing from the beginning and his score is set to zero.

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

<h3>3) End a session</h3>
Ideally a session ends when the player cannot continue his match and must play again from the beginning. 
Usually endSession corresponds to the 'Game Over' state. 

To end a session, you have to:
<ol>
	<li>call <i>GamefiveSDK.endSession()</i> method.
		You should call it with the score (integer or float) of that session.
	</li>
	<li>remove your game over screen</li>
</ol>

Warnings:
<ul>
	<li>You have to remove your game over screen because SDK display a game over screen already. If you don't remove your game over screen, there would be two screens duplicate.</li>
	<li>You must not only pass the value, but you have to pass an object containing the attribute <i>score</i>, this value should be the score of the session. This value must be a float or an integer.</li>
</ul>


```javascript
// call this method when a user end a game match
var scoreGame = 7888;
GamefiveSDK.endSession({
	score: scoreGame
});
```

<h2>Other methods</h2>

<h3>getAvatar</h3>
You can get avatar of the user calling <i>GamefiveSDK.getAvatar()</i>.

```javascript
var avatar = GamefiveSDK.getAvatar();
```

It returns two fields:
<ul>
	<li><b>src</b>: base64 of avatar</li>
	<li><b>name</b>: name of avatar file</li>
</ul>
We recommend using a <i>src</i> field.

<h3>getNickname</h3>
You can get nickname of the user calling <i>GamefiveSDK.getNickname()</i>.

```javascript
var avatar = GamefiveSDK.getNickname();
```

It returns a string containing the nickname of the user.

<h2>Initializing the SDK</h2>

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
<h3> Example </h3>

```javascript
GamefiveSDK.init({ 
	log: true,
	lite: false,
	debug: true
});
```
The <i>init</i> method will store the configuration parameters into an internal variable (<i>GamefiveSDK.config</i>) and perform the operations needed for properly initializing the SDK, i.e. connecting to Facebook (if you are not using the lite version). 

Please note that the <i>init</i> method will not create a new instance of <i>GamifiveSDK</i>, but it will just reset its configuration; in fact you can have only one instance of <i>GamifiveSDK</i> because it's implemented as a singleton. 

<h2>Using the SDK for sending the score only</h2>

The developer can just send the score of a session by using a reduced set of functionalities of the SDK. [...] // TODO


<h2>Using the SDK without Game Over screen</h2>

The developer can avoid loading the Game Over screen as follows: [...] // TODO


<h2>Migrating apps using v0.1 to v0.4 of the SDK</h2>

Apps featuring the 0.1 version of the SDK can be flawlessly migrated to v0.4 as follows [...] // TODO


<h2>Migrating apps using v0.3 to v0.4 of the SDK</h2>

Apps featuring the 0.3 version of the SDK can be flawlessly migrated to v0.4 as follows [...] // TODO
