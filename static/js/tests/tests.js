let timeout = 1000;

QUnit.test("CircularQueue single elements", (assert) => {
  let q = new CircularQueue(1);
  let kString = "0xdeadbeef";
  let kString2 = "0xbeefdead";

  assert.strictEqual(q.pop(), undefined);
  assert.strictEqual(q.length, 0);

  q.push(kString);

  assert.strictEqual(q.length, 1);
  assert.strictEqual(q.peek(), kString);
  assert.strictEqual(q.length, 1);
  assert.strictEqual(q.peek(), kString);

  assert.strictEqual(q.pop(), kString);
  assert.strictEqual(q.length, 0);
  assert.strictEqual(q.pop(), undefined);
  assert.strictEqual(q.length, 0);

  q.push(kString);
  assert.strictEqual(q.length, 1);
  q.push(kString2);
  assert.strictEqual(q.length, 1);

  assert.strictEqual(q.pop(), kString2);
  assert.strictEqual(q.pop(), undefined);
});

QUnit.test("CircularQueue multi-elements", (assert) => {
  let q = new CircularQueue(2);
  let kString = "0xdeadbeef";
  let kString2 = "0xbeefdead";

  q.push(kString);
  q.push(kString2);

  assert.strictEqual(q.pop(), kString2);
  assert.strictEqual(q.pop(), kString);

  q.push(kString);
  q.push(kString2);

  assert.deepEqual(q.array, [kString, kString2]);
});

QUnit.test("CircularQueue callback", (assert) => {
  let q = new CircularQueue(10, (data) => { return data.length });
  let kString = "0xdeadbeef";
  assert.strictEqual(q.push(kString), 10);
});

QUnit.test("ClientPeerJS.construct", (assert) => {
  let client_peerjs = new ClientPeerJS();
  assert.notOk(client_peerjs.device);
  assert.strictEqual(client_peerjs.do_render, false);
  let done = assert.async();

  setTimeout(() => {
    assert.strictEqual(client_peerjs.peerjs.open, true);
    assert.ok(client_peerjs.peerjs.id);
    assert.strictEqual(client_peerjs.id, client_peerjs.peerjs.id);
    assert.ok(client_peerjs.device);
    done();
  }, timeout);
});

QUnit.test("ClientPeerJS.peerjs.set", (assert) => {
  let client_peerjs = new ClientPeerJS();
  let done = assert.async();

  setTimeout(() => {
    let _peerjs = client_peerjs.peerjs;
    assert.strictEqual(_peerjs.destroyed, false);
    client_peerjs.peerjs = new Peer();
    assert.strictEqual(_peerjs.destroyed, true);
    done();
  }, timeout);
});

QUnit.test("ClientPeerJS.id.set", (assert) => {
  let client_peerjs = new ClientPeerJS();
  let done = assert.async();

  setTimeout(() => {
    client_peerjs.id = "0xdeadbeef";
    assert.strictEqual(client_peerjs.id, "0xdeadbeef");
    done();
  }, timeout);
});

QUnit.test("ServerPeerJS.construct", (assert) => {
  let server_peerjs = new ServerPeerJS();
  assert.strictEqual(server_peerjs.do_render, false);
  let done = assert.async();

  setTimeout(() => {
    assert.strictEqual(server_peerjs.peerjs.open, true);
    assert.ok(server_peerjs.peerjs.id);
    assert.strictEqual(server_peerjs.id, server_peerjs.peerjs.id);
    done();
  }, timeout);
});

QUnit.test("ServerPeerJS.clients.set", (assert) => {
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

QUnit.test("ClientPeerJS.join invalid", (assert) => {
  let client_peerjs = new ClientPeerJS();
  let done = assert.async(2);

  setTimeout(() => {
    let username = "my username";
    let server_id = "invalid server";
    client_peerjs.join(server_id, username);
    done();
    setTimeout(() => {
      assert.strictEqual(client_peerjs.metadata.open, false);
      done();
    }, timeout);
  }, timeout);
});

QUnit.test("ClientPeerJS.join valid", (assert) => {
  let client_peerjs = new ClientPeerJS();
  let server_peerjs = new ServerPeerJS();
  let done = assert.async(2);

  setTimeout(() => {
    let username = "my username";
    client_peerjs.join(server_peerjs.id, username);
    done();
    setTimeout(() => {
      assert.strictEqual(client_peerjs.metadata.open, true);
      assert.strictEqual(client_peerjs.metadata.peer, server_peerjs.peerjs.id);
      assert.strictEqual(client_peerjs.id in server_peerjs.clients, true);
      assert.strictEqual(server_peerjs.clients[client_peerjs.id].metadata.peer, client_peerjs.id);
      done();
    }, timeout);
  }, timeout);
});

QUnit.test("ClientPeerJS metadata data handling", (assert) => {
  let client_peerjs = new ClientPeerJS();
  let server_peerjs = new ServerPeerJS();
  let done = assert.async(3);

  setTimeout(() => {
    let username = "my username";
    let message = new MetadataJoinMessage(client_peerjs.id, username);
    client_peerjs.join(server_peerjs.id, username);
    done();
    setTimeout(() => {
      assert.deepEqual(server_peerjs.clients[client_peerjs.id].last_recv.id, message.json.id);
      assert.deepEqual(server_peerjs.clients[client_peerjs.id].last_recv.username, message.json.username);
      assert.deepEqual(server_peerjs.clients[client_peerjs.id].last_recv.type, message.json.type);
      done();
      setTimeout(function () {
        let message = new MetadataPseudoJoinMessage(client_peerjs.id, client_peerjs.username);
        assert.deepEqual(client_peerjs.last_recv.id, message.json.id);
        assert.deepEqual(client_peerjs.last_recv.username, message.json.username);
        assert.deepEqual(client_peerjs.last_recv.type, message.json.type);
        assert.strictEqual(client_peerjs.id in client_peerjs.peers, true);
        done();
      }, timeout);
    }, timeout);
  }, timeout);
});

QUnit.test("ClientPeerJS peer drop", (assert) => {
  let alice = new ClientPeerJS();
  let bob = new ClientPeerJS();
  let server = new ServerPeerJS();
  let done = assert.async(3);

  assert.strictEqual(alice.id in server.clients, false);
  assert.strictEqual(bob.id in server.clients, false);
  assert.strictEqual(alice.id in bob.peers, false);

  setTimeout(() => {
    alice.join(server.id, "alice");
    bob.join(server.id, "bob");
    done();
    setTimeout(() => {
      assert.strictEqual(alice.id in server.clients, true);
      assert.strictEqual(bob.id in server.clients, true);
      assert.strictEqual(alice.id in bob.peers, true);
      assert.strictEqual(alice.metadata.open, true);
      assert.strictEqual(bob.metadata.open, true);
      alice.drop();
      done();
      setTimeout(() => {
        assert.strictEqual(alice.id in server.clients, false);
        assert.strictEqual(bob.id in server.clients, true);
        assert.strictEqual(alice.id in bob.peers, false);
        done();
      }, timeout);
    }, timeout);
  }, timeout);
});

QUnit.test("ClientPeerJS peer connect", (assert) => {
  let alice = new ClientPeerJS();
  let bob = new ClientPeerJS();
  let server = new ServerPeerJS();
  let done = assert.async(2);

  setTimeout(() => {
    alice.join(server.id, "alice");
    bob.join(server.id, "bob");
    done();
    setTimeout(() => {
      assert.strictEqual(alice.username, "alice");
      assert.strictEqual(bob.username, "bob");

      assert.strictEqual(alice.id in server.clients, true);
      assert.strictEqual(bob.id in server.clients, true);

      assert.strictEqual(alice.id in bob.peers, true);
      assert.strictEqual(bob.id in bob.peers, true);

      assert.strictEqual(alice.id in alice.peers, true);
      assert.strictEqual(bob.id in alice.peers, true);

      assert.strictEqual(alice.peers[alice.id].media, null);
      assert.strictEqual(alice.peers[alice.id].stream, null);
      assert.strictEqual(alice.peers[alice.id].id, alice.id);
      assert.strictEqual(alice.peers[alice.id].username, alice.username);

      assert.ok(alice.peers[bob.id].media);
      assert.ok(alice.peers[bob.id].stream);
      assert.strictEqual(alice.peers[bob.id].id, bob.id);
      assert.strictEqual(alice.peers[bob.id].username, bob.username);

      assert.strictEqual(bob.peers[bob.id].media, null);
      assert.strictEqual(bob.peers[bob.id].stream, null);
      assert.strictEqual(bob.peers[bob.id].id, bob.id);
      assert.strictEqual(bob.peers[bob.id].username, bob.username);

      assert.ok(bob.peers[alice.id].media);
      assert.ok(bob.peers[alice.id].stream);
      assert.strictEqual(bob.peers[alice.id].id, alice.id)
      assert.strictEqual(bob.peers[alice.id].username, alice.username);

      done();
    }, timeout);
  }, timeout);
});

QUnit.test("ClientPeerJS chat", (assert) => {
  let alice = new ClientPeerJS();
  let bob = new ClientPeerJS();
  let server = new ServerPeerJS();
  let done = assert.async(3);

  setTimeout(() => {
    alice.join(server.id, "alice");
    bob.join(server.id, "bob");
    done();
    setTimeout(() => {
      assert.strictEqual(alice.id in server.clients, true);
      assert.strictEqual(bob.id in server.clients, true);

      assert.strictEqual(bob.id in alice.peers, true);
      assert.strictEqual(alice.id in bob.peers, true);

      let kMessage = "hi bob";
      alice.broadcast(kMessage);
      done();

      setTimeout(() => {
        assert.strictEqual(alice.cache.length, 1);
        assert.strictEqual(bob.cache.length, 1);
        assert.strictEqual(server.cache.length, 1);

        alice_cache_msg = alice.peers[alice.id].cache.pop();
        bob_cache_msg = bob.peers[alice.id].cache.pop();
        server_cache_msg = server.cache.pop();
        assert.strictEqual(alice_cache_msg.message, kMessage);


        assert.deepEqual(alice_cache_msg, bob_cache_msg);
        assert.deepEqual(server_cache_msg, alice_cache_msg);
        done();
      }, timeout);
    }, timeout);
  }, timeout);
});

QUnit.test("ClientPeerJS chat cache", (assert) => {
  let alice = new ClientPeerJS();
  let bob = new ClientPeerJS();
  let eve = new ClientPeerJS();
  let server = new ServerPeerJS();
  let done = assert.async(4);

  setTimeout(() => {
    alice.join(server.id, "alice");
    bob.join(server.id, "bob");
    done();
    setTimeout(() => {
      alice.broadcast("hi bob");
      done();
      setTimeout(() => {
        eve.join(server.id, "eve");
        done();
        setTimeout(() => {
          assert.strictEqual(eve.cache.length, 1);
          let eve_cache_msg = eve.cache.pop();
          assert.strictEqual(eve_cache_msg.message, "hi bob");
          assert.strictEqual(eve_cache_msg.username, "alice");
          done();
        }, timeout);
      }, timeout);
    }, timeout);
  }, timeout);
});
