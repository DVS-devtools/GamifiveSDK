module.exports = function(HOST, GAME_ID = 'fakeid', COUNTRY_CODE = "ww-it"){
    return {
        "hash": "",
        "search": "",
        "pathname": `/${COUNTRY_CODE}/html5gameplay/${GAME_ID}/game/sample`,
        "port": "",
        "hostname": `${HOST}`,
        "host": `${HOST}`,
        "protocol": "http:",
        "origin": `http://${HOST}`,
        "href": `http://${HOST}/${COUNTRY_CODE}/html5gameplay/${GAME_ID}/game/sample`,    
    }
}