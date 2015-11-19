'use strict';

const cassandra = require('cassandra-driver');
const err = require("./JPAErrors");

module.exports = (function CassandraClientFactory()
{
    let instance;

    function createInstance(config)
    {
        if (!config)
        {
            let msg = "No Cassandra config found";
            throw new err.JPAInitError(msg); 
        }
        return new cassandra.Client(config);
    }

    return {
        getClient: function (config)
        {
            if (!instance)
            {
                instance = createInstance(config);
            }
            return instance;
        }
    };
})();
