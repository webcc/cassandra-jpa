"use strict";
let jpa = require('cassandra-jpa');
let configuration = null;
module.exports = configuration || initConfig();
function initConfig()
{
    configuration = new jpa.JPAConfiguration();
    configuration.cassandra.contactPoints = ["localhost"];
    configuration.cassandra.keyspace = "tests";
    return configuration;
}