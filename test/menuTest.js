var VHostResponseMock = require("./mocks/vHost");
var Menu, menuElement;

require('jasmine-ajax');

describe("Menu",function(){    

    beforeEach(function() {
        jasmine.Ajax.install();        
        Menu = require("../src/components/menu/menu");
    });

    afterEach(function(){
        jasmine.Ajax.uninstall();
        Menu = null;
        menuElement = null;
    });

    it('show and hide work', function(done){
        
        Menu.setSpriteImage(VHostResponseMock.IMAGES_SPRITE_GAME);           
            
        Menu.show();

        menuElement = document.getElementById('gfsdk-more-games');
    
        expect(menuElement.style.display).toBe('block');

        Menu.hide();
    
        expect(menuElement.style.display).toBe('none');
        done();

    });

    it('set custom style before showing the button', function(done){
        
        Menu.setCustomStyle({top: '47px'});

        Menu.show();

        menuElement = document.getElementById('gfsdk-more-games');
    
        expect(menuElement.style.top).toBe('47px');
        done();
    });

    it('set custom style after showing the button', function(done){

        Menu.show();

        Menu.setCustomStyle({top: '14px'});

        menuElement = document.getElementById('gfsdk-more-games');
    
        expect(menuElement.style.top).toEqual('14px');

        done();
    });

    it('reset style after showing the menu', function(done){
            
        Menu.show();

        Menu.setCustomStyle({top: '7px', 'background-image': 'anotherImage'});

        menuElement = document.getElementById('gfsdk-more-games');

        Menu.resetStyle();
        
        expect(menuElement.style['top']).toEqual('50%');
        expect(menuElement.style['background-image']).not.toEqual('anotherImage');

        done();   
    });

});