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
