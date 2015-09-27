'use strict';
let cassandra = require('cassandra-driver');
let err = require("./errors");
let JPAConfiguration = require('./JPAConfiguration');
let PersistenceUtils = require("./PersistenceUtils");
let CriteriaBuilder = require("./CriteriaBuilder");
let EntityManager = require("./EntityManager");
let Logger = require("./DefaultLogger");
module.exports = class EntityManagerFactory {
    constructor(config, persistenceUnitName)
    {
        this.entityManager = null;
        JPAConfiguration.validate(config);
        this.config = config;
        this.persistenceUnitName = persistenceUnitName;
        if (this.persistenceUnitName !== "undefined" && Array.isArray(this.config.cassandra))
        {
            this.config.cassandra = this.config[this.persistenceUnitName];
        }
        this.criteriaBuilder = new CriteriaBuilder();
        this.persistenceUtils = new PersistenceUtils();
        Logger = config.logger;
    }

    createEntityManager()
    {
        if (this.entityManager === null)
        {
            if (this.config.cassandra === null)
            {
                throw new err.JPAInitError("Failed to load config for " + this.persistenceUnitName, e);
            }
            this.entityManager = new EntityManager(this.config);
        }
        return this.entityManager;
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