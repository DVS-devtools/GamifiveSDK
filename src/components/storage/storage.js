import localforage from 'localforage';
import Location from '../location/location';
export let store = localforage.createInstance({
    driver: [
        localforage.INDEXEDDB,
        localforage.WEBSQL,
        localforage.LOCALSTORAGE
    ],
    name: 'GFSDK',
    storeName: Location.getOrigin()
});