QUnit.test( "ClientPeerJS.construct", function(assert) {
  let client_peer_js = new ClientPeerJS();
  assert.ok(client_peer_js.peerjs);
  setTimeout(function() {
    assert.ok(client_peer_js.peerjs.id);
    assert.strictEqual(client_peer_js.id, client_peer_js.peerjs.id);
    assert.async();
  }, 1000);
});
