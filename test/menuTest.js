var VHost = require("../src/components/vhost/vhost");
var Menu, menuElement;

require('jasmine-ajax');

describe("Menu",function(){    

    beforeEach(function() {
        jasmine.Ajax.install();
        VHost.reset();
        Menu = require("../src/components/menu/menu");
    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
        delete Menu;
        delete menuElement;
    });

    it('gets sprite from VHost', function(done){

        VHost.afterLoad(function(){
            Menu.show();
            menuElement = document.getElementById('gfsdk-more-games');

            var spriteNameRx = new RegExp(/moreGamesSpriteTestValue/g);
            var backgroundUrl = menuElement.style['background-image'];
            var spriteNameInBackgroundUrl = spriteNameRx.exec(backgroundUrl).length > 0;
            expect(spriteNameInBackgroundUrl).toEqual(true);
            done();
        });

        VHost.load();

        var request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            status: 200, 
            contentType: 'application/json',
            response: { IMAGES_SPRITE_GAME: 'moreGamesSpriteTestValue' },
            readyState: 4
        });
    });

    it('show and hide work', function(done){
        VHost.afterLoad(function(){
            
            Menu.show();

            menuElement = document.getElementById('gfsdk-more-games');
        
            expect(menuElement.style.display).toBe('block');

            Menu.hide();
        
            expect(menuElement.style.display).toBe('none');
            done();

        });

        VHost.load();

        var request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            status: 200, 
            contentType: 'application/json',
            response: { MORE_GAMES_BUTTON_SPRITE: 'moreGamesSpriteTestValue' },
            readyState: 4
        });
    });

    it('set custom style before showing the button', function(done){
        VHost.afterLoad(function(){
            
            Menu.setCustomStyle({top: '47px'});

            Menu.show();

            menuElement = document.getElementById('gfsdk-more-games');
        
            expect(menuElement.style.top).toBe('47px');
            done();

        });

        VHost.load();

        var request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            status: 200, 
            contentType: 'application/json',
            response: { MORE_GAMES_BUTTON_SPRITE: 'moreGamesSpriteTestValue' },
            readyState: 4
        });
    });

    it('set custom style after showing the button', function(done){
        VHost.afterLoad(function(){
            Menu.show();

            Menu.setCustomStyle({top: '14px'});

            menuElement = document.getElementById('gfsdk-more-games');
        
            expect(menuElement.style.top).toBe('14px');

            done();

        });

        VHost.load();

        var request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            status: 200, 
            contentType: 'application/json',
            response: { MORE_GAMES_BUTTON_SPRITE: 'moreGamesSpriteTestValue' },
            readyState: 4
        });
    });

    it('reset style after showing the menu', function(done){
        VHost.afterLoad(function(){
            
            Menu.show();

            Menu.setCustomStyle({top: '7px', 'background-image': 'anotherImage'});

            menuElement = document.getElementById('gfsdk-more-games');

            Menu.resetStyle();
            
            expect(menuElement.style['top']).toEqual('50%');
            expect(menuElement.style['background-image']).not.toEqual('anotherImage');

            done();
            
        });

        VHost.load();

        var request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            status: 200, 
            contentType: 'application/json',
            response: { MORE_GAMES_BUTTON_SPRITE: 'moreGamesSpriteTestValue' },
            readyState: 4
        });
    });

});