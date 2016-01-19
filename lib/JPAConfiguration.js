"use strict";

const cassandra = require('cassandra-driver');
const typly = require('typly');
const err = require("./JPAErrors");
const Entity = require("./Entity");
const DefaultRowInterceptor = require("./DefaultRowInterceptor");

module.exports = class JPAConfiguration {
    constructor(config)
    {
        Object.assign(this, JPAConfiguration.defaults());
        if(typly.isObject(config))
        {
            Object.assign(this, config);
        }
        if(process.env.CASSANDRA_DBHOST && process.env.CASSANDRA_DBHOST.length>0)
        {
            this.cassandra.contactPoints = process.env.CASSANDRA_DBHOST.split(",");
        }
        this.ttl = [process.env.CASSANDRA_TTL || this.ttl];
        this.cassandra.keyspace = process.env.CASSANDRA_KEYSPACE || this.cassandra.keyspace;
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
        config.ttl = 86400; //one day
        config.cassandra = {
            keyspace: "tests",
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
                prepare: true
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
        config.logQueryObject = false;
        return config;
    }
};
