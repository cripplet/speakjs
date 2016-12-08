/**
 * Creates a new ClientConnection data object.
 * @class
 */
// TODO(minkezhang): rename PeerConnection
class PeerConnection {
  constructor() {
    this._username = null;
    this._media = null;
    this._text = null;
  }

  get username() { return (() => this.getUsername())(); }
  set username(value) { return ((value) => this.setUsername(value))(value); }

  get media() { return (() => this.getMedia())(); }
  set media(value) { return ((value) => this.setMedia(value))(value); }

  get text() { return (() => this.getText())(); }
  set text(value) { return ((value) => this.setText(value))(value); }

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
    this._username = null;
    this._peerjs = null;
    this._metadata = null;  /* data connection to ServerPeerJS */
    this._id = null;

    this.peers = new Proxy({}, {
      set: (target, key, value) => this.setPeersEntry(target, key, value),
      deleteProperty: (target, key) => this.deletePeersEntry(target, key),
    });

    this.peerjs = new Peer(config);
  }

  /**
   * properties
   */
  get peerjs() { return (() => this.getPeerJS())(); }
  set peerjs(value) { return ((value) => this.setPeerJS(value))(value); }

  get id() { return (() => this.getId())(); };
  set id(value) { return ((value) => this.setId(value))(value); }

  get username() { return (() => this.getUsername())(); }
  set username(value) { return ((value) => this.setUsername(value))(value); }

  get metadata() { return (() => this.getMetadata())(); }
  set metadata(value) { return ((value) => this.setMetadata(value))(value); }

  /**
   * methods
   */

  /**
   * Function invoked when joining the SpeakJS server.
   *
   * @param {string} server_id The PeerJS unique ID for the SpeakJS server.
   * @param {string} username The username of the SpeakJS client.
   */
  join(server_id, username) {
    this.username = username;
    this.metadata = this.peerjs.connect(server_id, {
        reliable: true,
    });
  }

  drop() {
    this.username = null;
  }

  /**
   * getters
   */

  getId() { return this._id; }
  getPeerJS() { return this._peerjs; }
  getUsername() { return this._username; }
  getMetadata() { return this._metadata; }

  /**
   * setters
   */

  // TODO(minkezhang): set element property in HTML
  setId(value) { this._id = value; }

  setPeerJS(value) {
    if (this._peerjs) {
      this._peerjs.destroy();
    }
    this._peerjs = value;
    this.id = this.peerjs.id;
    if (this._peerjs) {
      this._peerjs.on("open", (id) => this.onPeerJSOpen(id));
      // this._peerjs.on("close", () => { /* on closing a peerjs connection */ }());
      // this._peerjs.on("call", (media_connection) => { /* recieve call */ }(media_connection));
      // this._peerjs.on("connection", (data_connection) => { /* receive chat */ }(data_connection));
      // this._peerjs.on("disconnected", () => { this._peerjs.reconnect(); }());
    }
  }

  // TODO(minkezhang): insert HTML
  setUsername(value) { this._username = value; }

  // TODO(minkezhang): insert HTML
  setMetadata(value) { this._metadata = value; }

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
