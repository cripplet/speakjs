/**
 * Creates a new ClientConnection data object.
 * @class
 */
class ClientConnection {
  constructor() {
    this._id = null;
    this._username = null;
    this._metadata = null;
    this._last_recv = null;
    this.is_joined = false;
  }

  get id() { return this.getId(); }
  set id(value) { return this.setId(value); }

  get username() { return this.getUsername(); }
  set username(value) { return this.setUsername(value); }

  get metadata() { return this.getMetadata(); }
  set metadata(value) { return this.setMetadata(value); }

  get last_recv() { return this.getLastRecv(); }
  set last_recv(value) { return this.setLastRecv(value); }

  /**
   * getters
   */

  getUsername() { return this._username; }
  getMetadata() { return this._metadata; }
  getLastRecv() { return this._last_recv; }
  getId() { return this._id; }

  /**
   * setters
   */

  // TODO(minkezhang): install handler
  setUsername(value) { this._username = value; }

  // TODO(minkezhang): install handler
  setMetadata(value) { this._metadata = value; }

  // TODO(minkezhang): install HTML
  setLastRecv(value) { this._last_recv = value; }

  setId(value) { this._id = value; }
}


/**
 * Creates a new ServerPeerJS for SpeakJS.
 * @class
 */
class ServerPeerJS {
  constructor() {
    this._peerjs = null;
    this._id = null;

    this.clients = new Proxy(new Map(), {
      set: (target, key, value) => this.setClientsEntry(target, key, value),
      deleteProperty: (target, key) => this.deleteClientsEntry(target, key),
    });

    this.peerjs = new Peer(config);

    this.metadata_dispatch_table = {}
    this.metadata_dispatch_table[TYPE_METADATA_JOIN] = (data) => this._dispatchMetadataJoin(data);
    this.metadata_dispatch_table[TYPE_METADATA_DROP] = (data) => this._dispatchMetadataDrop(data);
  }

  /**
   * properties
   */

  get peerjs() { return this.getPeerJS(); }
  set peerjs(value) { return this.setPeerJS(value); }

  get id() { return this.getId(); };
  set id(value) { return this.setId(value); }

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

  deleteClientsEntry(target, key) {
    if (target[key].metadata != null) {
      target[key].metadata.close();
    }
    return delete target[key];
  }

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
   * Function invoked when SpeakJS client connects to the server. 
   *
   * // TODO(minkezhang): fix doc
   * @param {PeerJS.dataConnection} data_connection The connection to the client.
   */
  onPeerJSConnection(data_connection) {
    this.clients[data_connection.peer] = new ClientConnection();
    this.clients[data_connection.peer].username = data_connection.metadata.username;
    this.clients[data_connection.peer].metadata = data_connection;
    this.clients[data_connection.peer].metadata.on(
        "data", this.onMetadataData(data_connection.peer));
  }

  /**
   * Function invoked when a server receives some data from a client.
   *
   * @param {string} client_id The client to which this function is contextualized.
   */
  onMetadataData(client_id) {
    return (data) => {
      this.clients[client_id].last_recv = data;
      if (data.type in this.metadata_dispatch_table) {
        this.metadata_dispatch_table[data.type](data);
      }
    }
  }

  /**
   * dispatch table functions
   */

  _dispatchMetadataJoin(data) {
    this.clients[data.id].username = data.username;
    this.clients[data.id].is_joined = true;
    for (let client_id in this.clients) {  // TODO(minkezhang): change to for..of syntax
      if (this.clients[client_id].is_joined) {
        let pseudo_join = new MetadataPseudoJoinMessage(client_id, this.clients[client_id].username);
        this.clients[data.id].metadata.send(pseudo_join.json);
        if (client_id != data.id) {
          this.clients[client_id].metadata.send(data);
        }
      }
    }
  }

  _dispatchMetadataDrop(data) {
    delete this.clients[data.id];
    for (let client_id in this.clients) {  // TODO(minkezhang): change to for..of syntax
      this.clients[client_id].metadata.send(data);
    }
  }
}
