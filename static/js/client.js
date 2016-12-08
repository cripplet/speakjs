/**
 * Creates a new ClientConnection data object.
 * @class
 */
class ClientConnection {
  constructor() {
    this._username = null;
    this._media = null;
    this._text = null;
  }

  get username() { return () => this.getUsername(); }
  set username(value) { return (value) => this.setUsername(value); }

  get media() { return () => this.getMedia(); }
  set media(value) { return (value) => this.setMedia(value); }

  get text() { return () => this.getText(); }
  set text(value) { return (value) => this.setText(value); }

  /**
   * getters
   */

  getUsername() { return this._username; }
  getMedia() { return this._media; }
  getText() { return this._text; }

  /**
   * setters
   */

  // TODO(minkezhang): install handler
  setUsername(value) { this._username = value; }

  // TODO(minkezhang): install handler
  setMedia(value) { this._media = value; }

  // TODO(minkezhang): install handler
  setText(value) {
    this._text = value;
    // TODO(minkezhang): install this._text.on("data", ...) here
  }
}


/**
 * Creates a new ClientPeerJS for SpeakJS.
 * @class
 */
class ClientPeerJS {
  constructor() {
    this._peerjs = null;
    this._metadata = null;  /* data connection to ServerPeerJS */ // TODO(minkezhang): install getters / setters for this
    this._id = null;

    this.peers = new Proxy({}, {
      set: (target, key, value) => this.setPeersEntry(target, key, value),
      deleteProperty: (target, key) => this.deletePeersEntry(target, key),
    });

    this.peerjs = new Peer(config);
  }

  get peerjs() { return () => this.getPeerJS(); }
  set peerjs(value) { return (value) => this.setPeerJS(value); }

  get id() { () => this.getId() };
  set id(value) { return (value) => this.setId(value); }

  /**
   * getters
   */

  getId() { return this._id; }
  getPeerJS() { return this._peerjs; }

  /**
   * setters
   */

  setPeerJS(value) {
    if (this._peerjs) {
      this._peerjs.destroy();
    }
    this._peerjs = value;
    if (this._peerjs) {
      this._peerjs.on("open", () => this.onPeerJSOpen());
      // this._peerjs.on("close", () => { /* on closing a peerjs connection */ }());
      // this._peerjs.on("call", (mediaConnection) => { /* recieve call */ }(mediaConnection));
      // this._peerjs.on("connection", (dataConnection) => { /* receive chat */ }(dataConnection));
      // this._peerjs.on("disconnected", () => { this._peerjs.reconnect(); }());
    }
  }

  // TODO(minkezhang): set element property in HTML
  setId(value) { this._id = value; }

  // TODO(minkezhang): install handler here
  setPeersEntry(target, key, value) { target[key] = value; }

  /**
   * delete operators
   */

  // TODO(minkezhang): install handler here
  deletePeersEntry(target, key) { return delete target[key]; }

  /**
   * event handlers
   */

  /**
   * Function invoked when connected to the PeerJS signalling server.
   *
   * @param {string} id The PeerJS unique ID.
   */
  onPeerJSOpen(id) { this.id = id; }
}
