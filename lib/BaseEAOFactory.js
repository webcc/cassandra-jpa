"use strict";
let PersistenceConfiguration = require('./PersistenceConfiguration');
let BaseEAO = require('./BaseEAO');
let CassandraClientFactory = require("./CassandraClientFactory");
let Logger;
module.exports = class BaseEAOFactory
{
    constructor(config)
    {
        PersistenceConfiguration.validate(config);
        this.config = config;
        if(config.cassandra.client === null)
        {
            this.client = CassandraClientFactory.getClient(config.cassandra);
        }
        else
        {
            this.client = config.cassandra.client;
        }
        Logger = config.logger;
        this.eao = {};
        this.eao.baseEAO = this.getBaseEAO();
    }

    getAllEAO()
    {
        return this.eao;
    }

    getBaseEAO()
    {
        if (!this.eao.baseEAO)
        {
            this.eao.baseEAO = new BaseEAO(this.config);
        }
        return this.eao.baseEAO;
    }
};
