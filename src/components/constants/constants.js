module.exports = {

    PAYWALL_ELEMENT_ID: 'paywall',
    MAX_RECORDED_SESSIONS_NUMBER: 2,
    FB_SDK_VERSION: '2.4',
    FB_SDK_URL: 'connect.facebook.net/en_US/all.js',
    OVERLAY_ELEMENT_ID: 'gfsdk_root',
    BACK_BUTTON_SELECTOR:'#backBtn',
    DEFAULT_MENU_STYLE: {
        'left': '2px',
        'height': '60px',
        'background-position': '-5px -475px',
        'top': '50%',
        'margin-top': '-22px',
        'z-index': '9',
        'width': '60px',
        'position': 'absolute',
        'cursor':'pointer'
    },
    IMMUTABLE_MENU_STYLE_PROPERTIES: [
        'transform-origin',
        'transform',
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
    ERROR_END_SESSION_PARAM: 'GamifiveSDK :: Session :: end :: invalid type of data: expected number, got ',
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
    ERROR_USER_MISSING_INFO: 'GamifiveSDK :: User :: Missing userInfo ',
    ERROR_GAMEINFO_FETCH_FAIL: 'GamifiveSDK :: GameInfo :: couldn\'t retrieve game info: ',
    ERROR_VHOST_LOAD_FAIL: 'GamifiveSDK :: Vhost :: couldn\'t retrieve vhost: ',

    CONTENT_ID_REGEX: '(html5gameplay|sdk_integration_test|games)\/([a-zA-Z0-9]+)', // games in hybrid case(folder name)
    NEWTON_DEBUG_SECRET:'_BdH,S;lTr%Fd+#fka-]',  

    // API
    VHOST_API_URL: '/v01/config.getvars?keys=',
    GAME_INFO_API_URL: '/v01/gameplay?content_id=',
    GAMEOVER_API_URL: '/v01/gameover',
    LEADERBOARD_API_URL: '/v01/leaderboard',
    CAN_DOWNLOAD_API_URL: '/v01/user.candownload/:ID',
    USER_SET_LIKE: '/v01/favorites.set',
    USER_GET_LIKE: '/v01/favorites.get',
    USER_DELETE_LIKE: '/v01/favorites.delete',
    GAME_OVER_JSON_API_URL: '/v01/json/gameover/:CONTENT_ID', // ?score=&duration=

    GAMEINFO_JSON_FILENAME:'offlineData.json',
    USER_JSON_FILENAME:'user.json',
    USER_DATA_JSON_FILENAME:'userData.json',
    VHOST_JSON_FILENAME:'config.json',
    DICTIONARY_JSON_FILENAME:'dict.json'
}   