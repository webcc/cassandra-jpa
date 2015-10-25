"use strict";

let cassandra = require('cassandra-driver');
let err = require("./errors");
let Entity = require("./Entity");
let DefaultRowInterceptor = require("./DefaultRowInterceptor");

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
    }

    static defaults()
    {
        let config = {};
        let distance = cassandra.types.distance;
        let pooling = {
            coreConnectionsPerHost: {}
        };
        pooling.coreConnectionsPerHost[ distance.local ] = 4;
        pooling.coreConnectionsPerHost[ distance.remote ] = 1;
        config.keySpace = "tests";
        config.ttl = undefined;
        config.logQueryObject = false;
        config.cassandra = {
            contactPoints: [ "localhost" ],
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
