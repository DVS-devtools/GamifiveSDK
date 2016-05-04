var Logger = require("../src/components/logger/logger");
var logLevel = 'info';

describe("Logger is enabled at level " + logLevel,function(){
    
    it("Logger is defined and working", function(){

        expect(Logger).toBeDefined();
        Logger.init({level: logLevel});
        
    });

    
});