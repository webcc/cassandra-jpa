"use strict";

describe("cassandra-jpa::CassandraClientFactory", function ()
{
    const assert = require("assert");
    const CassandraClientFactory = require("../lib/CassandraClientFactory");
    const cassandra = require('cassandra-driver');
    const JPAConfiguration = require("../lib/JPAConfiguration");
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