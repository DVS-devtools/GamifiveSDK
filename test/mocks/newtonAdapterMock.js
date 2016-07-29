module.exports = function(){
    this.init = function(){
        console.log([].slice.call(arguments));
    }

    this.trackEvent = function(){
        console.log([].slice.call(arguments));
    }
}