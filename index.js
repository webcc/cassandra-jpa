"use strict";
module.exports = {
    CassandraTable: require("./lib/MetaModel"),
    PersistenceConfiguration: require("./lib/PersistenceConfiguration"),
    BaseEAO: require("./lib/EntityManager"),
    BaseEAOFactory: require("./lib/BaseEAOFactory"),
    CassandraClientFactory: require("./lib/CassandraClientFactory"),
    CassandraEntity: require("./lib/Entity")
};