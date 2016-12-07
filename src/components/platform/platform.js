import platform from 'platform';

let _platform = platform;
let setMock = ()=>{}
let isTesting = false;
if (process.env.NODE_ENV === 'testing'){
	isTesting = true;
	setMock = (UAString)=>{
		_platform = platform.parse(UAString)
	}
}

/**
 * Returns true if the browser is running on Android device
 * @returns {Boolean} - true if it's android
 */
const isAndroid = ()=>{
	if(_platform.name && typeof _platform.name === 'string'){
		return _platform.name.indexOf('Android') > -1;
	} else {
		return false;
	}
}

/**
 * Returns true if the browser is running on iOS devices
 * @returns {Boolean} - true if it's ios
 */
const isIOS = ()=>{
	let os = _platform.os.family;
	if(os && typeof os === 'string'){
		os = os.toLowerCase();
		return os.indexOf('ios') > -1;
	} else {
		return false;
	}
}

/**
 * Returns true if the browser is running on macOSX system
 * it's not equal to isIOS
 * @returns {Boolean} - true if it's macOSX
 */
const isMacOS = ()=>{
	let os = _platform.os.family;
	if(os && typeof os === 'string'){
		os = os.toLowerCase();
		return os.indexOf('os x') > -1;
	} else {
		return false;
	}
}
export {isIOS, isAndroid, isMacOS, setMock};