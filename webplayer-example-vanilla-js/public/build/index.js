// The public callback events
export const allowedEvents = {
    success: 1,
    error: 1,
    someOtherEvent: 1,
    somePublicMethodResponse: 1,
};
// The public API
export const allowedMethods = {
    somePublicMethod: 1,
};
class CorelliumWebplayer {
    constructor({ token, domain, deviceId, containerId, }) {
        this._token = token;
        this._appendedChild = null;
        this._domain = domain;
        this._deviceId = deviceId;
        this._containerId = containerId;
        this._connection = null;
        this._remoteHandle = null;
        this._localHandle = null;
        // Client-registered listeners using the `.on` method.
        // Only 1 callback per listener type allowed for now.
        this._listeners = {};
        this.setupPostMe()
            .then(() => {
            const childFrame = this.setupIframe();
            if (childFrame !== undefined && this._appendedChild && window.PostMe) {
                this.setupCommunication(this._appendedChild, window.PostMe);
            }
        })
            .catch(() => {
            console.error('Could not set up communication with the Corellium iframe.');
            throw new Error('Could not set up communication with the Corellium iframe.');
        });
    }
    async setupPostMe() {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            import('https://unpkg.com/post-me/dist/index.js')
                .then(() => {
                resolve(true);
            })
                .catch((err) => {
                console.error('Error setting up post-me.');
                reject();
            });
        });
    }
    setupIframe() {
        const src = `${this._domain}/web-player/login`;
        const childContainer = document.getElementById(this._containerId);
        const childFrame = document.createElement('iframe');
        childFrame.src = src;
        childFrame.name = 'child';
        childFrame.title = 'Corellium Web Player';
        childFrame.width = '100%';
        childFrame.style.border = 'none';
        childFrame.id = 'web-player';
        childFrame.style.display = 'none';
        childFrame.style.minHeight = '800px';
        childFrame.style.maxHeight = '100%';
        childFrame.style.margin = '0';
        childFrame.allow = 'camera;microphone';
        if (childContainer) {
            this._appendedChild = childContainer.appendChild(childFrame);
            return this._appendedChild;
        }
        throw new Error('Could not append child to container.');
    }
    setupCommunication(appendChild, postMe) {
        appendChild.onload = () => {
            if (!appendChild.contentWindow) {
                throw new Error('Could not get contentWindow from iframe.');
            }
            const WindowMessenger = postMe.WindowMessenger;
            const ParentHandshake = postMe.ParentHandshake;
            const messenger = new WindowMessenger({
                localWindow: window,
                remoteWindow: appendChild.contentWindow,
                remoteOrigin: this._domain,
            });
            ParentHandshake(messenger, {}, 10, 5000)
                .then((connection) => {
                this._connection = connection;
                this._remoteHandle = connection.remoteHandle();
                this._localHandle = connection.localHandle();
                this._localHandle.emit('connect', {
                    token: this._token,
                    deviceId: this._deviceId,
                });
                this._remoteHandle.addEventListener('message', (message) => {
                    if (message.status === 'success') {
                        setTimeout(() => {
                            const loadingElement = document.getElementById('corellium-loading');
                            const webPlayerElement = document.getElementById('web-player');
                            if (loadingElement) {
                                loadingElement.style.display = 'none';
                            }
                            if (!webPlayerElement) {
                                throw new Error('Could not find web-player element.');
                            }
                            webPlayerElement.style.display = 'block';
                            this._emit(message.status, message);
                        }, 2000);
                    }
                    else if (message.status === 'error') {
                        const errorElement = document.getElementById('corellium-error');
                        if (errorElement) {
                            errorElement.style.display = 'block';
                        }
                        this._emit(message.status, message);
                        throw new Error(message);
                    }
                    else {
                        // emit this message to the client
                        this._emit(message.status, message);
                    }
                });
                return {
                    status: 200,
                    message: 'success',
                };
            })
                .catch((err) => {
                this._emit('error', err);
                throw new Error(err);
            });
        };
    }
    // this method allows the client to register a listener
    on(eventName, callback) {
        if (!allowedEvents[eventName]) {
            throw new Error(`${eventName} is not allowed`);
        }
        this._listeners[eventName] = callback;
    }
    // this function is used by the eventListener to execute client code from the _listeners
    _emit(eventName, data) {
        this._listeners?.[eventName](data);
    }
    // this code allows the client to execute a public method in the iframe
    exec(methodName, data) {
        if (!allowedMethods[methodName]) {
            throw new Error(`${methodName} is not allowed`);
        }
        this._remoteHandle?.call(methodName, data);
        // the client must add an event listener using the `on` function to get a response
    }
}
export default CorelliumWebplayer;
