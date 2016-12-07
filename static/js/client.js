/**
 * Creates a new ClientConnection data object.
 * @class
 */
var ClientConnection = function() {
  this._username = null;
  this._media = null;
  this._text = null;

  Object.defineProperty(this, 'username', {
      get: this.getUsername.bind(this),
      set: this.setUsername.bind(this),
  });

  Object.defineProperty(this, 'media', {
      get: this.getMedia.bind(this),
      set: this.setMedia.bind(this),
  });

  Object.defineProperty(this, 'text', {
      get: this.getText.bind(this),
      set: this.setText.bind(this),
  });
}

/**
 * Getters
 */

ClientConnection.prototype.getUsername = function() {
  return this._username;
}

ClientConnection.prototype.getMedia = function() {
  return this._media;
}

ClientConnection.prototype.getText = function() {
  return this._text;
}

/**
 * Setters
 * TODO(minkezhang): add documentation
 */

ClientConnection.prototype.setUsername = function(value) {
  // TODO(minkezhang): install handler
  this._username = username;
}

ClientConnection.prototype.setMedia = function(value) {
  // TODO(minkezhang): install handler
  this._media = media;
}

ClientConnection.prototype.setText = function(value) {
  // TODO(minkezhang): install handler
  this._text = text;
  // TODO(minkezhang): install this._text.on("data", ...) here
}

/**
 * Creates a new ClientPeerJS for SpeakJS.
 * @class
 */
var ClientPeerJS = function() {
  this._peerjs = null;
  Object.defineProperty(this, "peerjs", {
      get: this.getPeerJS.bind(this),
      set: this.setPeerJS.bind(this),
  });

  this._metadata = null;  /* data connection to ServerPeerJS */ // TODO(minkezhang): install getters / setters for this

  this.peers = new Proxy({}, {
    set: this.setPeersEntry.bind(this),
    deleteProperty: this.deletePeersEntry.bind(this),
  });

  this._id = null;
  Object.defineProperty(this, "id", {
      get: this.getId.bind(this),
      set: this.setId.bind(this),
  });

  this.peerjs = new Peer(config);
}

/**
 * Getters
 */

ClientPeerJS.prototype.getId = function() {
  return this._id;
}

ClientPeerJS.prototype.getPeerJS = function() {
  return this._peerjs;
}

/**
 * Setters
 */

ClientPeerJS.prototype.setPeerJS = function(value) {
  if (this._peerjs) {
    this._peerjs.destroy();
  }
  this._peerjs = value;
  if (this._peerjs) {
    this._peerjs.on("open", this.onPeerJSOpen.bind(this));
    this._peerjs.on("close", function() { /* on closing a peerjs connection */ });
    this._peerjs.on("call", function(mediaConnection) { /* receive call */ });
    this._peerjs.on("connection", function(dataConnection) { /* receive chat */ });
    this._peerjs.on("disconnected", function() {
      this._peerjs.reconnect();
    });
  }
}

ClientPeerJS.prototype.setId = function(value) {
  // TODO(minkezhang): set element property in HTML
  this._id = value;
}

ClientPeerJS.prototype.setPeersEntry = function(target, key, value) {
  // TODO(minkezhang): install handler here
  target[key] = value;
}

/**
 * Delete operators
 */

ClientPeerJS.prototype.deletePeersEntry = function(target, key) {
  // TODO(minkezhang): install handler here
  return delete target[key];
}

/**
 * Event handlers
 */

/**
 * Function invoked when connected to the PeerJS signalling server.
 *
 * @param {string} id The PeerJS unique ID.
 */
ClientPeerJS.prototype.onPeerJSOpen = function(id) {
  this.id = id;
}

ClientPeerJS.prototype.onPeerJSClose = function() {}
