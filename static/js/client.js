/**
 * Creates a new ClientConnection data object.
 * @class
 */
class PeerConnection {
  constructor(cache, do_render) {
    this._id = null;
    this._username = null;
    this._media = null;
    this._text = null;
    this._stream = null;
    this._cache = cache;
    this._do_render = !!do_render;
  }

  get id() { return this.getId(); }
  set id(value) { return this.setId(value); }

  get username() { return this.getUsername(); }
  set username(value) { return this.setUsername(value); }

  get media() { return this.getMedia(); }
  set media(value) { return this.setMedia(value); }

  get text() { return this.getText(); }
  set text(value) { return this.setText(value); }

  get stream() { return this.getStream(); }
  set stream(value) { return this.setStream(value); }

  get cache() { return this.getCache(); }
  get do_render() { return this.getDoRender(); }

  /**
   * getters
   */

  getUsername() { return this._username; }
  getMedia() { return this._media; }
  getText() { return this._text; }
  getId() { return this._id; }
  getStream() { return this._stream; }
  getCache() { return this._cache; }
  getDoRender() { return this._do_render; }

  /**
   * setters
   */

  setUsername(value) { this._username = value; }

  setMedia(value) {
    this._media = value;
    this._media.on("stream", (stream) => this.onMediaStream(stream));
  }

  setText(value) {
    this._text = value;
    this._text.on("data", (data) => this.onTextData(data));
  }

  setId(value) { this._id = value; }

  setStream(value) {
    this._stream = value;
    if (this.do_render) {
      $(sprintf(layout.CLIENT_PEERS_ENTRY_AUDIO_FMT, {peer_id: this.id}))[0].src = (URL || webkitURL || mozURL).createObjectURL(this.stream);
    }
  }

  /**
   * event handlers
   */

  onMediaStream(stream) { this.stream = stream; }
  onTextData(data) { this.cache.push(data); }
}


/**
 * Creates a new ClientPeerJS for SpeakJS.
 * @class
 */
class ClientPeerJS {
  constructor(do_render) {
    this._device = null;
    this._id = null;
    this._last_recv = null;
    this._metadata = null;
    this._peerjs = null;
    this._username = null;
    this._cache = new CircularQueue(10, (data) => this.renderCache(data));
    this._server_id = null;
    this._do_render = !!do_render;

    navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
      this.device = stream;
    });

    this.peers = new Proxy(new Map(), {
      get: (target, key) => this.getPeersEntry(target, key),
      set: (target, key, value) => this.setPeersEntry(target, key, value),
      deleteProperty: (target, key) => this.deletePeersEntry(target, key),
    });

    this.peerjs = new Peer(config);

    this.metadata_dispatch_table = {}
    this.metadata_dispatch_table[TYPE_METADATA_PSEUDO_JOIN] = (data) => this._dispatchMetadataPseudoJoin(data);
    this.metadata_dispatch_table[TYPE_METADATA_JOIN] = (data) => this._dispatchMetadataJoin(data);
    this.metadata_dispatch_table[TYPE_METADATA_DROP] = (data) => this._dispatchMetadataDrop(data);
    this.metadata_dispatch_table[TYPE_CHAT] = (data) => this._dispatchMetadataChat(data);
  }

  /**
   * properties
   */

  get peerjs() { return this.getPeerJS(); }
  set peerjs(value) { return this.setPeerJS(value); }

  get id() { return this.getId(); };
  set id(value) { return this.setId(value); }

  get username() { return this.getUsername(); }
  set username(value) { return this.setUsername(value); }

  get metadata() { return this.getMetadata(); }
  set metadata(value) { return this.setMetadata(value); }

  get last_recv() { return this.getLastRecv(); }
  set last_recv(value) { return this.setLastRecv(value); }

  get device() { return this.getDevice(); }
  set device(value) { return this.setDevice(value); }

  get server_id() { return this.getServerId(); }
  set server_id(value) { return this.setServerId(value); }

  get cache() { return this.getCache(); }
  get do_render() { return this.getDoRender(); }

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
    if (this.metadata) {
      this.drop();
    }
    this.username = username;
    this.metadata = this.peerjs.connect(server_id, {
        reliable: true,
        metadata: { username: this.username },
    });
    this.metadata.on("data", (data) => this.onMetadataData(data));
    this.metadata.on("open", () => this.onMetadataOpen());
    this.metadata.on("close", () => this.onMetadataClose());
  }

  drop() {
    if (this.metadata === null) {
      return;
    }
    let data = new MetadataDropMessage(this.id);
    this.metadata.send(data.json);
    this.metadata = null;
    for (let peer_id in this.peers) {
      delete this.peers[peer_id];
    }
  }

  /**
   * getters
   */

  getDevice() { return this._device; }
  getId() { return this._id; }
  getPeerJS() { return this._peerjs; }
  getUsername() { return this._username; }
  getMetadata() { return this._metadata; }
  getLastRecv() { return this._last_recv; }
  getCache() { return this._cache; }
  getDoRender() { return this._do_render; }
  getServerId() { return this._server_id; }

  getPeersEntry(target, key) {
    if (!(key in target)) {
      target[key] = new PeerConnection(this.cache, this.do_render);
    }
    return target[key];
  }

  /**
   * setters
   */

  setDevice(value) { this._device = value; }

  setId(value) {
    this._id = value;
    if (this.do_render) {
      $(layout.CLIENT_CLIENT_ID).text(this.id);
    }
  }

  setServerId(value) {
    this._server_id = value;
    if (this.do_render) {
      $(layout.CLIENT_SERVER_ID).text(this.server_id);
    }
  }

  setPeerJS(value) {
    if (this._peerjs) {
      this._peerjs.destroy();
    }
    this._peerjs = value;
    this.id = this.peerjs.id;
    if (this._peerjs) {
      this._peerjs.on("open", (id) => this.onPeerJSOpen(id));
      this._peerjs.on("close", () => this.onPeerJSClose());
      this._peerjs.on("call", (media_connection) => this.onPeerJSCall(media_connection));
      this._peerjs.on("connection", (data_connection) => this.onPeerJSConnection(data_connection));
      this._peerjs.on("disconnected", () => this.onPeerJSDisconnected());
    }
  }

  setUsername(value) { this._username = value; }
  setMetadata(value) { this._metadata = value; }
  setLastRecv(value) { this._last_recv = value; }

  setPeersEntry(target, key, value) {
    if ((key in target) && target[key] != value) {
      delete target[key];
    }
    target[key] = value;
    return true;
  }

  /**
   * delete operators
   */

  deletePeersEntry(target, key) {
    if (!(key in target)) {
      return true;
    }
    if (this.do_render) {
      $(sprintf(layout.CLIENT_PEERS_ENTRY_FMT, {peer_id: key})).remove();
    }
    if (target[key].media != null) {
      target[key].media.close();
    }
    if (target[key].text != null) {
      target[key].text.close();
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

  onPeerJSClose() { this.id = null; }

  onPeerJSDisconnected() {
    try {
      this._peerjs.reconnect();
    }
    catch (e) {
      console.log("Error: Cannot reconnect.");
    }
  }

  onMetadataOpen() {
    this.server_id = this.metadata.peer;
    let message = new MetadataJoinMessage(this.id, this.username);
    this.metadata.send(message.json);
  }

  onMetadataClose() {
    this.server_id = null;
    delete this.metadata;
  }

  onMetadataData(data) {
    this.last_recv = data;
    if (data.type in this.metadata_dispatch_table) {
      this.metadata_dispatch_table[data.type](data);
    }
  }

  onPeerJSCall(media_connection) {
    this.peers[media_connection.peer].media = media_connection;
    this.peers[media_connection.peer].media.answer(this.device);
  }

  onPeerJSConnection(data_connection) {
    this.peers[data_connection.peer].text = data_connection;
  }

  renderCache(data) {
    if (this.do_render) {
      T.render(layout.CLIENT_CHAT_ENTRY_LAYOUT, (t) => {
        $(layout.CLIENT_CHAT).prepend(t({
          username: data.username,
          time: formatDate(data.datetime),
          message: data.message,
        }));
      });
    }
  }

  broadcast(message) {
    message = $.trim(message)
    if (!/\S/.test(message)) {
      return;
    }
    let data = new ChatMessage(this.id, this.username, message);
    this.peers[this.id].cache.push(data.json);
    for (let peer_id in this.peers) {
      if (peer_id != this.id) {
        this.peers[peer_id].text.send(data.json);
      }
    }
    this.metadata.send(data.json);
  }

  /**
   * dispatch table functions
   */

  _dispatchMetadataPseudoJoin(data) {
    this.peers[data.id].id = data.id;
    this.peers[data.id].username = data.username;
    if (this.do_render) {
      T.render(layout.CLIENT_PEERS_ENTRY_LAYOUT, (t) => {
        $(layout.CLIENT_PEERS).append(t({
          peer_id: data.id,
          username: data.username,
        }));
      });
    }
  }

  _dispatchMetadataJoin(data) {
    this._dispatchMetadataPseudoJoin(data);
    this.peers[data.id].media = this.peerjs.call(data.id, this.device);
    this.peers[data.id].text = this.peerjs.connect(data.id, {
        reliable: true,
    });
  }

  _dispatchMetadataDrop(data) {
    delete this.peers[data.id];
  }

  _dispatchMetadataChat(data) {
    this.cache.push(data);
  }
}
