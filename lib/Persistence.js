"use strict";
let EntityManagerFactory = require("./EntityManagerFactory");
let PersistenceUtils = require("./PersistenceUtils");
module.exports = class Persistence {
    static createEntityManagerFactory(persistenceUnitName, config)
    {
        return new EntityManagerFactory(config);
    }

    static getPersistenceUnitUtil()
    {
        return this.persistenceUtils;
    }
};