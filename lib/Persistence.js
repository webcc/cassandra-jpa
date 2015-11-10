"use strict";
let err = require("./errors");
let EntityManagerFactory = require("./EntityManagerFactory");
let PersistenceUtils = require("./PersistenceUtils");
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