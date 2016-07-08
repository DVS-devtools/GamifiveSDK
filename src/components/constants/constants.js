var Location = require('../location/location');

module.exports = {

    PAYWALL_ELEMENT_ID: 'paywall',
    MAX_RECORDED_SESSIONS_NUMBER: 2,
    FB_SDK_VERSION: '2.4',
    OVERLAY_ELEMENT_ID: 'gfsdk_root',
    DEFAULT_MENU_STYLE: {
        'left': '2px',
        'height': '44px',
        'background-position': '-22px -428px',
        'top': '50%',
        'margin-top': '-22px',
        'z-index': '9',
        'width': '43px',
        'position': 'absolute'
    },
    IMMUTABLE_MENU_STYLE_PROPERTIES: [
        'background-image',
        'background-position',
        'z-index',
        'width',
        'height'
    ],

    AFTER_LOAD_EVENT_KEY: 'VHOST_AFTER_LOAD',
    AFTER_INIT_EVENT_KEY: 'SESSION_AFTER_INIT',

    // Constants for error descriptions
    ERROR_USER_GET_BEFORE_FETCH: 'GamifiveSDK :: User :: cannot get any value before fetching user info',

    ERROR_LITE_TYPE: 'GamifiveSDK :: Session :: init :: invalid type for "lite" attribute: expected boolean, got ',

    ERROR_SESSION_ALREADY_STARTED: 'GamifiveSDK :: Session :: start :: previous session not ended',
    ERROR_SESSION_INIT_NOT_CALLED: 'GamifiveSDK :: Session :: start :: init not called',

    ERROR_SESSION_ALREADY_ENDED: 'GamifiveSDK :: Session :: end :: session already ended',
    ERROR_SESSION_NO_SESSION_STARTED: 'GamifiveSDK :: Session :: end :: no sessions started',
    ERROR_SCORE_TYPE: 'GamifiveSDK :: Session :: end :: invalid type of score: expected number, got ',
    ERROR_LEVEL_TYPE: 'GamifiveSDK :: Session :: end :: invalid type of level: expected number, got ',

    ERROR_ONSTART_CALLBACK_TYPE: 'GamifiveSDK :: Session :: onStart :: invalid value for callback: expected function, got ',

    ERROR_AFTERINIT_CALLBACK_TYPE: 'GamifiveSDK :: Session :: afterInit :: invalid value for callback: expected function, got ',
    
    ERROR_BARRIER_CALLBACK_TYPE: 'GamifiveSDK :: Barrier :: onComplete :: invalid value for callback: expected function, got ',
    ERROR_BARRIER_NO_EVENTS: 'GamifiveSDK :: Barrier :: invalid value for keysToWait: expected Array of strings, got ',
    ERROR_BARRIER_EMPTY_KEYS: 'GamifiveSDK :: Barrier :: keysToWait cannot be an empty Array',
    ERROR_BARRIER_INVALID_KEY_TYPE: 'GamifiveSDK :: Barrier :: invalid value for a key: expected string, got ',
    ERROR_BARRIER_KEY_UNKNOWN: 'GamifiveSDK :: Barrier :: unknown key ',

    ERROR_GAME_INFO_NO_CONTENTID: 'GamifiveSDK :: GameInfo :: getContentId :: cannot match any content id on url ',

    ERROR_USER_FETCH_FAIL: 'GamifiveSDK :: User :: couldn\'t retrieve user profile: ',
    ERROR_GAMEINFO_FETCH_FAIL: 'GamifiveSDK :: GameInfo :: couldn\'t retrieve game info: ',

    CONTENT_ID_REGEX: 'html5gameplay\/([a-zA-Z0-9]+)',

    // API
    VHOST_API_URL: Location.getOrigin() + '/v01/config.getvars?keys=',
    GAME_INFO_API_URL: Location.getOrigin() + '/v01/gameplay?content_id=',
    GAMEOVER_API_URL: Location.getOrigin() + '/v01/gameover',

    GAMEINFO_JSON_FILENAME:'gameinfo.json',
    USER_JSON_FILENAME:'user.json'
}   