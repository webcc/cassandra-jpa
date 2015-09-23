"use strict";
let cassandra = require('cassandra-driver');
let CassandraEntity = require("./CassandraEntity");
let logger = require('winston');
module.exports = class PersistenceConfiguration {
    constructor(config)
    {
        Object.assign(this, PersistenceConfiguration.defaults());
        if (typeof config !== "undefined" && config !== null)
        {
            Object.assign(this, config);
        }
    }
    static validate(config)
    {
        if(typeof config === "undefined")
        {
            throw new TypeError("PersistenceConfiguration is null");
        }
        if(config instanceof PersistenceConfiguration === false)
        {
            throw new TypeError("config is not PersistenceConfiguration");
        }
        if(typeof config.logger === "undefined")
        {
            throw new RangeError("logger has not been defined");
        }
    }
    static defaults()
    {
        let config = {};
        let distance = cassandra.types.distance;
        let pooling = {
            coreConnectionsPerHost: {}
        };
        pooling.coreConnectionsPerHost[distance.local] = 4;
        pooling.coreConnectionsPerHost[distance.remote] = 1;
        config.logger = logger;
        config.baseEntityClass = CassandraEntity;
        config.cassandra = {
            contactPoints: ["localhost"],
            keyspace: "imergo_tests",
            protocolOptions: {
                port: 9042
            },
            socketOptions: {
                connectTimeout: 5000
            },
            queryOptions: {
                fetchSize: 10000,
                autoPage: true,
                prepare: true,
                ttl: 600
            },
            authProvider: {
                username: "",
                password: ""
            },
            pooling: pooling
        };
        config.cassandra.client = null;
        return config;
    }
};
