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
    VHOST_API_URL: 'http://www2.gameasy.com/ww-it/v01/config.getvars?keys=',

    // Constant error descriptions
    ERROR_USER_GET_BEFORE_FETCH: 'GamifiveSDK :: User :: cannot get any value before fetching user info',

    ERROR_SESSION_ALREADY_STARTED: 'GamifiveSDK :: Session :: start :: previous session not ended',
    ERROR_SESSION_INIT_NOT_CALLED: 'GamifiveSDK :: Session :: start :: init not called',
    ERROR_SESSION_ALREADY_ENDED: 'GamifiveSDK :: Session :: end :: session already ended',
    ERROR_SESSION_NO_SESSION_STARTED: 'GamifiveSDK :: Session :: end :: no sessions started',

    ERROR_SCORE_TYPE: 'GamifiveSDK :: Session :: end :: invalid type of score: expected number, got ',
    ERROR_LEVEL_TYPE: 'GamifiveSDK :: Session :: end :: invalid type of level: expected number, got ',
    ERROR_ONSTART_CALLBACK_TYPE: 'GamifiveSDK :: Session :: onStart :: invalid value for callback: expected function, got '
}   