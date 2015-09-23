"use strict";
let assert = require("assert");
let CassandraClientFactory = require("../lib/CassandraClientFactory");
let cassandra = require('cassandra-driver');
let PersistenceConfiguration = require("../lib/PersistenceConfiguration");
describe("cassandra-persistence", function ()
{
    describe("#CassandraClientFactory", function ()
    {
        let config = (new PersistenceConfiguration()).cassandra;
        it("should create a client", function (done)
        {
            let client = CassandraClientFactory.getClient(config);
            assert.equal(client instanceof cassandra.Client, true);
            done();
        });
        it("should get same client", function (done)
        {
            let client = CassandraClientFactory.getClient(config);
            let client1 = CassandraClientFactory.getClient(config);
            assert.equal(client instanceof cassandra.Client, true);
            done();
        });
        it("should connect", function (done)
        {
            let client = CassandraClientFactory.getClient(config);
            client.connect(function(error, result) {
                assert.equal(error, null);
                done();
            });
        });
    });
}); 