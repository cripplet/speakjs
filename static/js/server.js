/**
 * Creates a new ClientConnection data object.
 * @class
 */
class ClientConnection {
  constructor() {
    this._username = null;
    this._metadata = null;
  }

  get username() { return (() => this.getUsername())(); }
  set username(value) { return ((value) => this.setUsername(value))(value); }

  get metadata() { return (() => this.getMetadata())(); }
  set metadata(value) { return ((value) => this.setMetadata(value))(value); }

  /**
   * getters
   */

  getUsername() { return this._username; }
  getMetadata() { return this._metadata; }

  /**
   * setters
   */

  // TODO(minkezhang): install handler
  setUsername(value) { this._username = value; }

  // TODO(minkezhang): install handler
  setMetadata(value) { this._metadata = value; }
}


/**
 * Creates a new ServerPeerJS for SpeakJS.
 * @class
 */
class ServerPeerJS {
  constructor() {
    this._peerjs = null;
    this._id = null;

    this.clients = new Proxy({}, {
      set: (target, key, value) => this.setClientsEntry(target, key, value),
      deleteProperty: (target, key) => this.deleteClientsEntry(target, key),
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

  /**
   * getters
   */

  getId() { return this._id; }
  getPeerJS() { return this._peerjs; }

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
      this._peerjs.on("connection", (data_connection) => this.onPeerJSConnection(data_connection));
      // this._peerjs.on("disconnected", () => { this._peerjs.reconnect(); }());
    }
  }

  // TODO(minkezhang): install handler here
  setClientsEntry(target, key, value) {
    if ((key in target) && target[key] != value) {
      delete target[key];
    }
    target[key] = value;
    return true;
  }

  /**
   * delete operators
   */

  // TODO(minkezhang): install handler here
  deleteClientsEntry(target, key) { return delete target[key]; }

  /**
   * event handlers
   */

  /**
   * Function invoked when connected to the PeerJS signalling server.
   *
   * @param {string} id The PeerJS unique ID.
   */
  onPeerJSOpen(id) { this.id = id; }

  /**
   * Function invoked when connected to 
   *
   * // TODO(minkezhang): fix doc
   * @param {PeerJS.dataConnection} data_connection The connection to the client.
   */
  onPeerJSConnection(data_connection) {
    this.clients[data_connection.peer] = new ClientConnection();
    this.clients[data_connection.peer].metadata = data_connection;
  }
}
