var Location = require('../location/location');
/**
 * Calculate the weight of the event according 
 * to user type and vhost configuration
 * 
 * @param {GameInfo}
 * @param {User}
 * @param {VHost}
 * @param {string}
 * @param {string}
 * @returns {object}
 */
module.exports.calculateContentRanking = function(GameInfo, User, VHost, eventCategory, eventName){
    var contentRanking = VHost.get('CONTENT_RANKING');
    var userFrom = Location.hasKey('dest') || Location.hasKey('trackExecutionKey') ? 'acquisition' : 'natural';
    var userType = User.getUserType();
    var scopeType = 'social';
    var ranking = 0;

    // ranking score
    if(userType === 'premium'){
        ranking = contentRanking[eventCategory][eventName][userType][userFrom];
    } else {
        ranking = contentRanking[eventCategory][eventName][userType];
    }

    // scopeType
    if(eventCategory == 'Play'){
        scopeType = 'consumption';
    }

    return {
        contentId: GameInfo.getContentId(), 
        score: ranking, 
        scope: scopeType
    };
}