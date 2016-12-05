var key = "dnu57xap0ysyvi";
var config = {
  key: key,
  config: {
    "iceServers": [
        { url: "stun:stun.l.google.com:19302" },
        { url: "turn:numb.viagenie.ca", username: "webrtc@live.com", credential: "muazkh" }
    ]
  }
};

var METADATA = "metadata";

var BaseMessage = function() {
  return {
  };
}

/**
 * metadata messages
 */

var TYPE_METADATA_CONN = 0;
var TYPE_METADATA_DROP = 1;
var TYPE_METADATA_PSEUDOCONN = 2;  // update the peer list but do not actually call

var MetadataBaseMessage = function(type) {
  var message = BaseMessage();
  message.type = type;
  return message;
}

var MetadataConnMessage = function(id, username) {
  var message = MetadataBaseMessage(TYPE_METADATA_CONN);
  message.id = id;
  message.username = username;
  return message;
}

var MetadataPseudoConnMessage = function(id, username) {
  var message = MetadataConnMessage(id, username);
  message.type = TYPE_METADATA_PSEUDOCONN;
  return message;
}

var MetadataDropMessage = function(id) {
  var message = MetadataBaseMessage(TYPE_METADATA_DROP);
  message.id = id;
  return message;
}
