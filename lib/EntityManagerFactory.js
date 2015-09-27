'use strict';
let cassandra = require('cassandra-driver');
let err = require("./errors");
let PersistenceConfiguration = require('./PersistenceConfiguration');
let PersistenceUtils = require("./PersistenceUtils");
let CriteriaBuilder = require("./CriteriaBuilder");
let Logger;

module.exports = class EntityManagerFactory
{
    constructor(config)
    {
        PersistenceConfiguration.validate(config);
        this.config = config;
        this.criteriaBuilder = new CriteriaBuilder();
        this.persistenceUtils = new PersistenceUtils();
        this.createEntityManager(config);
        Logger = config.logger;
        this.eao = {};
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

    createEntityManager(config)
    {
        if(config.cassandra.client === null)
        {
            this.client = CassandraClientFactory.getClient(config.cassandra);
        }
        else
        {
            this.client = config.cassandra.client;
        }
        this.eao.baseEAO = this.getBaseEAO();
    }
    getCriteriaBuilder()
    {
        return this.criteriaBuilder;
    }
    getPersistenceUnitUtil()
    {
        return this.persistenceUtils;
    }
    getProperties()
    {
        return this.config;
    }
    isOpen()
    {
        return !(this.client === null);
    }
};