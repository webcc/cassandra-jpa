"use strict";
let cassandra = require('cassandra-driver');
let err = require("./errors");
let Entity = require("./Entity");
let DefaultRowInterceptor = require("./DefaultRowInterceptor");
let logger = require('./DefaultLogger');
module.exports = class JPAConfiguration {
    constructor(config)
    {
        Object.assign(this, JPAConfiguration.defaults());
        if (typeof config !== "undefined" && config !== null)
        {
            Object.assign(this, config);
        }
    }

    static validate(config)
    {
        if (typeof config === "undefined")
        {
            throw new TypeError("JPAConfiguration is null");
        }
        if (config instanceof JPAConfiguration === false)
        {
            throw new TypeError("config is not JPAConfiguration");
        }
        if (typeof config.logger === "undefined")
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
        config.baseEntityClass = Entity;
        config.cassandra = {
            contactPoints: ["webcc-db"],
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
            encoding: {
                map: Map,
                set: Set
            },
            pooling: pooling
        };
        config.cassandra.client = null;
        config.rowInterceptor = new DefaultRowInterceptor();
        return config;
    }
};
