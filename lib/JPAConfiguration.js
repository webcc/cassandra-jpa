"use strict";
let cassandra = require('cassandra-driver');
let typly = require('typly');
let err = require("./errors");
let Entity = require("./Entity");
let DefaultRowInterceptor = require("./DefaultRowInterceptor");
module.exports = class JPAConfiguration {
    constructor(config)
    {
        Object.assign(this, JPAConfiguration.defaults());
        if(typly.isObject(config))
        {
            Object.assign(this, config);
        }
        this.cassandra.contactPoints = [process.env.CASSANDRA_DBHOST || this.cassandra.contactPoints[0]];
        this.keySpace = [process.env.CASSANDRA_KEYSPACE || this.keySpace];
        this.ttl = [process.env.CASSANDRA_TTL || this.ttl];
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
        config.keySpace = "tests";
        config.ttl = 86400; //one day
        config.cassandra = {
            contactPoints: ["localhost"],
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
        config.rowInterceptor = new DefaultRowInterceptor();
        return config;
    }
};
