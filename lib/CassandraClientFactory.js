'use strict';
let cassandra = require('cassandra-driver');
let JPAError = require("./errprs").JPAError;
module.exports = (function CassandraClientFactory()
{
    let instance;

    function createInstance(config)
    {
        if (!config)
        {
            let msg = "No Cassandra config found";
            throw new JPAError(msg);
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
