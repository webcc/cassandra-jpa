'use strict';

let cassandra = require('cassandra-driver');
let err = require("./errors");
let JPAConfiguration = require('./JPAConfiguration');
let PersistenceUtils = require("./PersistenceUtils");
let CriteriaBuilder = require("./CriteriaBuilder");
let EntityManager = require("./EntityManager");

module.exports = class EntityManagerFactory {
    constructor(config, persistenceUnitName)
    {
        this.entityManager = null;
        JPAConfiguration.validate(config);
        this.config = config;
        this.persistenceUnitName = persistenceUnitName;
        if (this.persistenceUnitName !== "undefined" && Array.isArray(this.config.cassandra))
        {
            this.config.cassandra = this.config[ this.persistenceUnitName ];
        }
        this.criteriaBuilder = new CriteriaBuilder();
    }

    createEntityManager(metaModel)
    {
        if (this.config.cassandra === null)
        {
            throw new err.JPAInitError("Failed to load config for " + this.persistenceUnitName,
                e);
        }
        return new EntityManager(this.config, metaModel);
    }

    getCriteriaBuilder(metaModel)
    {
        return this.entityManager.getCriteriaBuilder(metaModel);
    }

    static getPersistenceUnitUtils()
    {
        return PersistenceUtils;
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