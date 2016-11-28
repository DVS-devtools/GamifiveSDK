import Network from '../network/network';
import Location from '../location/location';
import Constants from '../constants/constants';

export class Banner{
    /**
     * @param {Object} props
     * @param {String} props.containerSelector - the selector of container example: #native-modal
     * @param {String} props.closeButtonSelector - the selector of the close button button#close-button
     * @param {Function} props.onInstallClick - the function to call when user interacts
     * @param {Function} props.onCloseClick - the function to call when user interacts
     * @param {Function} props.onOpen - every time the pop up is opened
     * @param {Function} props.onLoad - called when the component is injected in the dom
     */
    constructor(props){
        this.props = props;
        this.load()
            .then(()=>{
                this.props.onLoad();
            });
    }

    closeButtonHandler(e){
        e.preventDefault();
        this.close();
        this.props.onCloseClick();
    } 
    
    installButtonHandler(e){
        e.preventDefault();
        this.props.onInstallClick();
    }

    install(){
        this.props.onInstallClick();
    }

    close(){
        this.container.classList.add("hidden");
    }

    open(){
        this.container.classList.remove("hidden");
        this.props.onOpen();
    }

    load(){
        /**
         * Get the HTML
         */
        return Network.xhr('GET', [Location.getOrigin(), Constants.INGAME_BANNER].join(''), {responseType: 'document'})
            .then((resp)=>{
                /** 
                 * Get the HTMLElements 
                 */
                this.container = resp.responseXML.querySelector(this.props.containerSelector);
                this.closeButton = this.container.querySelector(this.props.closeButtonSelector);
                this.installButton = this.container.querySelector(this.props.installButtonSelector);
                
                /** Attach listeners */
                this.closeButton.addEventListener('touchend', this.closeButtonHandler.bind(this), false);
                this.closeButton.addEventListener('click', this.closeButtonHandler.bind(this), false);

                this.installButton.addEventListener('touchend', this.installButtonHandler.bind(this), false);
                this.installButton.addEventListener('click', this.installButtonHandler.bind(this), false);
                /** Render it */
                window.document.body.appendChild(this.container);
            });
    }
}