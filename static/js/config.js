let key = "dnu57xap0ysyvi";
let config = {
  key: key,
  config: {
    "iceServers": [
        { url: "stun:stun.l.google.com:19302" },
        { url: "turn:numb.viagenie.ca", username: "webrtc@live.com", credential: "muazkh" }
    ]
  }
};

/**
 * Layout IDs
 */
let layout = {
  SERVER_SERVER_ID: "#server_server_id_val",
  SERVER_CLIENT_URL: "#server_client_url_val",

  SERVER_CHAT: "#server_cache_val",

  SERVER_CLIENTS: "#server_client_list_val",
  SERVER_CLIENTS_ENTRY_LAYOUT: "server_client_entry",
  SERVER_CLIENTS_ENTRY_FMT: "#server_client_entry_%(client_id)s",
  SERVER_CLIENTS_ENTRY_LAST_RECV_FMT: "#server_client_entry_last_recv_%(client_id)s_val",

  CLIENT_CLIENT_ID: "#client_client_id_val",
  CLIENT_SERVER_ID: "#client_server_id_val",

  CLIENT_CHAT: "#client_log_var",
  CLIENT_CHAT_ENTRY_LAYOUT: "client_chat_entry",

  CLIENT_PEERS: "#client_peer_list_val",
  CLIENT_PEERS_ENTRY_LAYOUT: "client_peer_entry",
  CLIENT_PEERS_ENTRY_FMT: "#client_peer_entry_%(peer_id)s",
  CLIENT_PEERS_ENTRY_AUDIO_FMT: "#client_peer_entry_audio_%(peer_id)s_audio",
}

let logSupportStatus = () => {
  let status = {
      getusermedia: Modernizr.getusermedia,
      audio: Modernizr.audio,
      video: Modernizr.video,
      datachannel: Modernizr.datachannel,
      peerconnection: Modernizr.peerconnection
  }
  console.log(status);
}

class CircularQueue {
  constructor(size, callback) {
    if (size === undefined) {
      throw Error("CicularBuffer.size must be specified");
    }
    if (size <= 0) {
      throw Error("CircularBuffer.size must be a positive integer");
    }
    this.size = size;
    this.write_head = 0;
    this.buffer = [];
    this._length = 0;
    this.callback = callback;
  }

  peek() {
    return this.buffer[this.write_head - 1 % this.size];
  }

  pop() {
    let r = this.peek();
    this.buffer[this.write_head - 1 % this.size] = undefined;
    this.write_head--;
    this._length = Math.max(this._length - 1, 0);
    return r;
  }

  push(value) {
    if (this.buffer.length < this.size) {
      this.buffer.push(value);
    } else {
      this.buffer[this.write_head % this.size] = value;
    }
    this._length = Math.min(this._length + 1, this.size);
    this.write_head++;
    if (this.callback != null) {
      return this.callback(value);
    }
  }

  *[Symbol.iterator]() {
    for(let offset = 0; offset < this.buffer.length; offset++) {
      yield this.buffer[(this.write_head + offset) % this.buffer.length];
    }
  }

  get length() { return this._length; }
  get array() {
    let r = [];
    for (let el of this) {
      r.push(el);
    }
    return r;
  }
}

class BaseMessage {
  constructor(type, id) {
    this.type = type;
    this.id = id;
    this.datetime = new Date();
  };
  get json() { return this.getJson(); }

  /**
   * Cannot send classes over PeerJS data connection.
   */
  getJson() {
    return JSON.parse(JSON.stringify(this));
  }
}

/**
 * chat messages
 */

let TYPE_CHAT = 3;

class ChatMessage extends BaseMessage {
  constructor(id, username, message) {
    super(TYPE_CHAT, id);
    this.username = username;
    this.message = message;
  }
}

/**
 * metadata messages
 */

let TYPE_METADATA_JOIN = 0;
let TYPE_METADATA_DROP = 1;
let TYPE_METADATA_PSEUDO_JOIN = 2;  // update the peer list but do not actually call

class MetadataJoinMessage extends BaseMessage {
  constructor(id, username) {
    super(TYPE_METADATA_JOIN, id);
    this.username = username;
  }
}

class MetadataPseudoJoinMessage extends BaseMessage {
  constructor(id, username) {
    super(TYPE_METADATA_PSEUDO_JOIN, id);
    this.username = username;
  }
}

class MetadataDropMessage extends BaseMessage {
  constructor(id) {
    super(TYPE_METADATA_DROP, id);
  }
}
