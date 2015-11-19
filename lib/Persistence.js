"use strict";

const err = require("./JPAErrors");
const EntityManagerFactory = require("./EntityManagerFactory");
const PersistenceUtils = require("./PersistenceUtils");

module.exports = class Persistence {
    static createEntityManagerFactory(persistenceUnitName, config)
    {
        return new EntityManagerFactory(config, persistenceUnitName);
    }

    static getPersistenceUnitUtils()
    {
        return PersistenceUtils;
    }
};