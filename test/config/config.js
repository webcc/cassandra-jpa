"use strict";
let jpa = require('cassandra-jpa');
let configuration = null;
module.exports = configuration || initConfig();
function initConfig()
{
    configuration = new jpa.JPAConfiguration();
    configuration.cassandra.contactPoints = ["localhost"];
    configuration.cassandra.keyspace = "tests";
    configuration.logQueryObject = true;
    configuration.cassandra.contactPoints = [process.env.JPA_HOST || configuration.cassandra.contactPoints[0]];
    configuration.cassandra.keyspace = process.env.JPA_KEYSPACE || configuration.cassandra.keyspace;
    return configuration;
}