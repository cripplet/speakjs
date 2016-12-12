/**
 * Creates a new ClientConnection data object.
 * @class
 */
class ClientConnection {
  constructor(do_render) {
    this._id = null;
    this._username = null;
    this._metadata = null;
    this._last_recv = null;
    this.is_joined = false;
    this._do_render = !!do_render;
  }

  get id() { return this.getId(); }
  set id(value) { return this.setId(value); }

  get username() { return this.getUsername(); }
  set username(value) { return this.setUsername(value); }

  get metadata() { return this.getMetadata(); }
  set metadata(value) { return this.setMetadata(value); }

  get last_recv() { return this.getLastRecv(); }
  set last_recv(value) { return this.setLastRecv(value); }

  get do_render() { return this.getDoRender(); }

  /**
   * getters
   */

  getUsername() { return this._username; }
  getMetadata() { return this._metadata; }
  getLastRecv() { return this._last_recv; }
  getId() { return this._id; }
  getDoRender() { return this._do_render; }

  /**
   * setters
   */

  // TODO(minkezhang): install handler
  setUsername(value) {
    if (this._username != null) {
      throw new Error("Cannot set property more than once.");
    }
    this._username = value;
  }

  // TODO(minkezhang): install handler
  setMetadata(value) { this._metadata = value; }

  setLastRecv(value) {
    this._last_recv = value;
    if (this.do_render) {
      $(sprintf(
          layout.SERVER_CLIENTS_ENTRY_LAST_RECV_FMT,
          {client_id: this.id})
      ).text(JSON.stringify(this.last_recv));
    }
  }

  setId(value) {
    if (this._id != null) {
      throw new Error("Cannot set property more than once.");
    }
    this._id = value;
  }
}


/**
 * Creates a new ServerPeerJS for SpeakJS.
 * @class
 */
class ServerPeerJS {
  constructor(do_render) {
    this._peerjs = null;
    this._id = null;
    this._cache = new CircularQueue(10, (data) => this.renderCache(data));
    this._do_render = !!do_render;

    this.clients = new Proxy(new Map(), {
      set: (target, key, value) => this.setClientsEntry(target, key, value),
      deleteProperty: (target, key) => this.deleteClientsEntry(target, key),
    });

    this.peerjs = new Peer(config);

    this.metadata_dispatch_table = {}
    this.metadata_dispatch_table[TYPE_METADATA_JOIN] = (data) => this._dispatchMetadataJoin(data);
    this.metadata_dispatch_table[TYPE_METADATA_DROP] = (data) => this._dispatchMetadataDrop(data);
    this.metadata_dispatch_table[TYPE_CHAT] = (data) => this._dispatchMetadataChat(data);
  }

  /**
   * properties
   */

  get peerjs() { return this.getPeerJS(); }
  set peerjs(value) { return this.setPeerJS(value); }

  get id() { return this.getId(); }
  set id(value) { return this.setId(value); }

  get cache() { return this.getCache(); }
  get do_render() { return this.getDoRender(); }

  /**
   * getters
   */

  getId() { return this._id; }
  getPeerJS() { return this._peerjs; }
  getCache() { return this._cache; }
  getDoRender() { return this._do_render; }

  /**
   * setters
   */

  setId(value) {
    this._id = value;
    if (this.do_render) {
      $(layout.SERVER_SERVER_ID).text(this.id);
      $(layout.SERVER_CLIENT_URL).text(sprintf(
          "%(base)s?server=%(id)s", {
              base: window.location.href.match(/^.*\//),
              id: this.id,
          }));
    }
  }

  setPeerJS(value) {
    if (this._peerjs) {
      this._peerjs.destroy();
    }
    this._peerjs = value;
    if (this._peerjs) {
      this._peerjs.on("open", (id) => this.onPeerJSOpen(id));
      // this._peerjs.on("close", () => { /* on closing a peerjs connection */ }());
      this._peerjs.on("connection", (data_connection) => this.onPeerJSConnection(data_connection));
      this._peerjs.on("disconnected", () => this.onPeerJSDisconnected());
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
    if (this.do_render) {
      $(sprintf(layout.SERVER_CLIENTS_ENTRY, {client_id: key})).remove();
    }
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
    this.clients[data_connection.peer] = new ClientConnection(this.do_render);
    this.clients[data_connection.peer].id = data_connection.peer;
    this.clients[data_connection.peer].username = data_connection.metadata.username;
    this.clients[data_connection.peer].metadata = data_connection;
    this.clients[data_connection.peer].metadata.on(
        "data", this.onMetadataData(data_connection.peer));
    this.clients[data_connection.peer].metadata.on(
        "close", this.onMetadataClose(data_connection.peer));

    if (this.do_render) {
      T.render("server_client_entry", (t) => {
        $(layout.SERVER_CLIENTS).append(t({
            client_id: data_connection.peer,
            username: data_connection.metadata.username,
        }));
      });
    }
  }

  onPeerJSDisconnected() {
    try {
      this._peerjs.reconnect();
    }
    catch (e) {
      console.log("Error: Cannot reconnect.");
    }
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

  onMetadataClose(client_id) {
    return () => {
      delete this.clients[client_id];
    }
  }

  renderCache(data) {
    if (this.do_render) {
      T.render("server_chat_entry", (t) => {
        $(layout.SERVER_CHAT).append(t({data: JSON.stringify(data)}));
      });
      if ($(layout.SERVER_CHAT).children().length >= this.cache.size) {
        $(layout.SERVER_CHAT).find(":first-child").remove();
      }
    }
  }

  /**
   * dispatch table functions
   */

  _dispatchMetadataJoin(data) {
    this.clients[data.id].is_joined = true;
    // TODO(minkezhang): change to for..of syntax
    for (let client_id in this.clients) {
      if (this.clients[client_id].is_joined) {
        let pseudo_join = new MetadataPseudoJoinMessage(
            client_id, this.clients[client_id].username);
        this.clients[data.id].metadata.send(pseudo_join.json);
        if (client_id != data.id) {
          this.clients[client_id].metadata.send(data);
        }
      }
    }
    for (let message of this.cache) {
      this.clients[data.id].metadata.send(message);
    }
  }

  _dispatchMetadataDrop(data) {
    delete this.clients[data.id];
    // TODO(minkezhang): change to for..of syntax
    for (let client_id in this.clients) {
      this.clients[client_id].metadata.send(data);
    }
  }

  _dispatchMetadataChat(data) {
    this.cache.push(data);
  }
}
