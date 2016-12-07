import { isIOS, isAndroid, isMacOS, setMock } from '../src/components/platform/platform';
describe("Platform test", function(){
    let UserAgentIPhone6 = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';
    let UserAgentAndroid = 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30';
    let UserAgentChromeOnMacOS = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';

    beforeEach(()=> {
        
    });

    afterEach(()=> {
        
    });

    it('Test isIOS', ()=>{
        setMock(UserAgentIPhone6);

        expect(isIOS()).toBe(true);
        expect(isAndroid()).toBe(false);
    })
    
    it('Test isAndroid should be true', ()=>{
        setMock(UserAgentAndroid);

        expect(isAndroid()).toBe(true);
        expect(isIOS()).toBe(false);
        expect(isMacOS()).toBe(false);
    });

    it('Test isAndroid should be false when chrome desktop', ()=>{
        setMock(UserAgentChromeOnMacOS);

        expect(isAndroid()).toBe(false);
        expect(isIOS()).toBe(false);
        expect(isMacOS()).toBe(true);
    });

    it('Test isMacOs should be true when browser Chrome', ()=>{
        setMock(UserAgentChromeOnMacOS);
        
        expect(isIOS()).toBe(false);
        expect(isAndroid()).toBe(false);
        expect(isMacOS()).toBe(true);
    });
});