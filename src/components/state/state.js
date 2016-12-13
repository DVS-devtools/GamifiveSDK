import { version } from '../../version';
export default {
    init:{
        pending:false,
        finished:false
    },
    userDataPromise:null,
    userDataTask:{
        isFetching:false,
        isSaving:false
    },
    version: version
}