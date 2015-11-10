"use strict";
let assert = require("assert");
let CassandraClientFactory = require("../lib/CassandraClientFactory");
let cassandra = require('cassandra-driver');
let JPAConfiguration = require("../lib/JPAConfiguration");
describe("cassandra-jpa::CassandraClientFactory", function ()
{
    let jpaConfig = new JPAConfiguration();
    let config = jpaConfig.cassandra;
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
        client.connect(function (error, result)
        {
            assert.equal(error, null);
            done();
        });
    });
});