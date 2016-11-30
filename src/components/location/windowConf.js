import { Utils } from 'stargatejs';
module.exports = function(OPTIONS){
    let OPTIONS_DEFAULT = {
        host: 'appsworld.gamifive-app.com', 
        game_id: 'fakeid', 
        country_code: 'ww-it'
    };
    let FINAL_OPTIONS = {...OPTIONS_DEFAULT, ...OPTIONS};
    let QUERY = Utils.queryfy("", FINAL_OPTIONS);
    return {
        "hash": "",
        "search": `${QUERY}`,
        "pathname": `/${FINAL_OPTIONS.country_code}/html5gameplay/${FINAL_OPTIONS.game_id}/game/sample`,
        "port": "",
        "hostname": `${FINAL_OPTIONS.host}`,
        "host": `${FINAL_OPTIONS.host}`,
        "protocol": "http:",
        "origin": `http://${FINAL_OPTIONS.host}`,
        "href": `http://${FINAL_OPTIONS.host}/${FINAL_OPTIONS.country_code}/html5gameplay/${FINAL_OPTIONS.game_id}/game/sample${QUERY}`,    
    }
}