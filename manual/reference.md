<a name="GamefiveSDK"></a>
#class: GamefiveSDK
The GamefiveSDK for JavaScript consists of a single JS file to be included in a SCRIPT element in the HEAD tag of your game HTML.

**Members**

* [class: GamefiveSDK](#GamefiveSDK)
  * [new GamefiveSDK()](#new_GamefiveSDK)
  * [gamefiveSDK.updateConfig(confObject)](#GamefiveSDK#updateConfig)
  * [gamefiveSDK.startSession()](#GamefiveSDK#startSession)
  * [gamefiveSDK.endSession(endingParams)](#GamefiveSDK#endSession)
  * [gamefiveSDK.status()](#GamefiveSDK#status)

<a name="new_GamefiveSDK"></a>
##new GamefiveSDK()
Main SDK Class 0.1 JSDoc Reference

**Author**: Stefano Sergio  
<a name="GamefiveSDK#updateConfig"></a>
##gamefiveSDK.updateConfig(confObject)
Updates the config if needed by the user

**Params**

- confObject `object` - Configuration object  
  - \[logEnabled=false\] `boolean` - Logging state, only for debug  
  - \[httpEnabled=true\] `boolean` - Enable/Disable xhr calls, should always be TRUE  

<a name="GamefiveSDK#startSession"></a>
##gamefiveSDK.startSession()
Defines the start of a session. A session is a continued user activity like a game match and the start of a session usually corresponds
<br>
Ideally a session starts when the player starts playing from the beginning and his score is set to zero. So in this version of the API
the startSession must be called alongside with the PLAY function of your game.<br>

<a name="GamefiveSDK#endSession"></a>
##gamefiveSDK.endSession(endingParams)
Defines the end of a session. A session is a continued user activity like a game match. <br>
It should end with the score of that session. 
Ideally a session ends when the player cannot continue his match and must play again from the beginning. <br>
For example: if the player has x "lifes" then the session only ends when all the x "lifes" are lost. <br>
<i>.startSession must be called first.</i>

**Params**

- endingParams `object` - Some parameters can be sent inside an object to enrich the user statistics.  
  - score `object` - User score for the ended session.  

<a name="GamefiveSDK#status"></a>
##gamefiveSDK.status()
Get SDK Status and Data

**Returns**: `Object` - Object containing Session and User Information  
