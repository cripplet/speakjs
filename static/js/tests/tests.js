QUnit.test("ClientPeerJS.construct", function(assert) {
  let client_peer_js = new ClientPeerJS();
  let done = assert.async();
  setTimeout(function() {
    assert.strictEqual(client_peer_js.peerjs.open, true);
    assert.ok(client_peer_js.peerjs.id);
    assert.strictEqual(client_peer_js.id, client_peer_js.peerjs.id);
    done();
  }, 500);
});

QUnit.test("ClientPeerJS.peerjs.set", function(assert) {
  let client_peer_js = new ClientPeerJS();
  let done = assert.async();
  setTimeout(function() {
    let _peerjs = client_peer_js.peerjs;
    assert.strictEqual(_peerjs.destroyed, false);
    client_peer_js.peerjs = new Peer();
    assert.strictEqual(_peerjs.destroyed, true);
    done();
  }, 500);
});

QUnit.test("ClientPeerJS.id.set", function(assert) {
  let client_peer_js = new ClientPeerJS();
  let done = assert.async();
  setTimeout(function() {
    client_peer_js.id = "0xdeadbeef";
    assert.strictEqual(client_peer_js.id, "0xdeadbeef");
    done();
  }, 500);
});
