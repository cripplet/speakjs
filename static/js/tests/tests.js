let timeout = 1000;

QUnit.test("ClientPeerJS.construct", function(assert) {
  let client_peerjs = new ClientPeerJS();
  let done = assert.async();

  setTimeout(function() {
    assert.strictEqual(client_peerjs.peerjs.open, true);
    assert.ok(client_peerjs.peerjs.id);
    assert.strictEqual(client_peerjs.id, client_peerjs.peerjs.id);
    done();
  }, timeout);
});

QUnit.test("ClientPeerJS.peerjs.set", function(assert) {
  let client_peerjs = new ClientPeerJS();
  let done = assert.async();

  setTimeout(function() {
    let _peerjs = client_peerjs.peerjs;
    assert.strictEqual(_peerjs.destroyed, false);
    client_peerjs.peerjs = new Peer();
    assert.strictEqual(_peerjs.destroyed, true);
    done();
  }, timeout);
});

QUnit.test("ClientPeerJS.id.set", function(assert) {
  let client_peerjs = new ClientPeerJS();
  let done = assert.async();

  setTimeout(function() {
    client_peerjs.id = "0xdeadbeef";
    assert.strictEqual(client_peerjs.id, "0xdeadbeef");
    done();
  }, timeout);
});

QUnit.test("ServerPeerJS.construct", function(assert) {
  let server_peerjs = new ServerPeerJS();
  let done = assert.async();

  setTimeout(function() {
    assert.strictEqual(server_peerjs.peerjs.open, true);
    assert.ok(server_peerjs.peerjs.id);
    assert.strictEqual(server_peerjs.id, server_peerjs.peerjs.id);
    done();
  }, timeout);
});

QUnit.test("ServerPeerJS.clients.set", function(assert) {
  let server_peerjs = new ServerPeerJS();

  let key = "0xdeadbeef";
  let val = "buffered value";

  assert.strictEqual(key in server_peerjs.clients, false);
  server_peerjs.clients[key] = val;
  assert.strictEqual(key in server_peerjs.clients, true);
  assert.strictEqual(server_peerjs.clients[key], val);
  delete server_peerjs.clients[key];
  assert.strictEqual(key in server_peerjs.clients, false);
});

QUnit.test("ClientPeerJS.join invalid", function(assert) {
  let client_peerjs = new ClientPeerJS();
  let done = assert.async(2);

  setTimeout(function() {
    let username = "my username";
    let server_id = "invalid server";
    client_peerjs.join(server_id, username);
    setTimeout(function() {
      assert.strictEqual(client_peerjs.metadata.open, false);
      done();
    }, timeout);
    assert.ok(true);
    done();
  }, timeout);
});

QUnit.test("ClientPeerJS.join valid", function(assert) {
  let client_peerjs = new ClientPeerJS();
  let server_peerjs = new ServerPeerJS();
  let done = assert.async(2);

  setTimeout(function() {
    let username = "my username";
    client_peerjs.join(server_peerjs.id, username);
    setTimeout(function() {
      assert.strictEqual(client_peerjs.metadata.open, true);
      assert.strictEqual(client_peerjs.metadata.peer, server_peerjs.peerjs.id);
      assert.strictEqual(client_peerjs.id in server_peerjs.clients, true);
      assert.strictEqual(server_peerjs.clients[client_peerjs.id].metadata.peer, client_peerjs.id);
      done();
    }, timeout);
    done();
  }, timeout);
});
