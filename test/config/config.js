"use strict";
let jpa = require('cassandra-jpa');
let configuration = null;
module.exports = configuration || initConfig();
function initConfig()
{
    let config = {
        cassandra: {
            contactPoints: ["webcc-db"],
            keyspace: "imergo_tests",
        }
    };
    configuration = new jpa.PersistenceConfiguration(config);
    return configuration;
}