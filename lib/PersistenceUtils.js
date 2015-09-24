"use strict";
let TimeUuid = require('cassandra-driver').types.TimeUuid;
module.exports = class PersistenceUtils {
    static getTimeUuid(s)
    {
        if (s)
        {
            if (typeof s === "string" && s.length > 0)
            {
                let isDate = Date.parse(s);
                if (isDate)
                {
                    s = TimeUuid.fromDate(s);
                }
                else
                {
                    s = TimeUuid.fromString(s);
                }
            }
            else if (typeof s === "object")
            {
                let isDate = Date.parse(s);
                if (isDate)
                {
                    s = TimeUuid.fromDate(s);
                }
            }
            else
            {
                throw new PersistenceError("Unexpected input to convert to TimeUuid " + typeof s);
            }
        }
        else
        {
            s = TimeUuid.now();
        }
        return s;
    }

    static json2CQLmap(json)
    {
        if (!json)
        {
            return null;
        }
        let _ = require("underscore");
        let map = {};
        for (var key in json)
        {
            if (json.hasOwnProperty(key))
            {
                if (!_.isString(json[key]))
                {
                    if (json[key])
                    {
                        map[key] = json[key].toString();
                    }
                    else
                    {
                        map[key] = json[key];
                    }
                }
                else
                {
                    map[key] = json[key].replace(/\"/g, "&quot;").replace(/\'/g, "&apos;");
                }
            }
        }
        return JSON.stringify(map, null, 0).replace(/\"/g, "\'").replace(/&quot;/g,
        '"').replace(/&apos;/g, "''");
    }

    static cqlStringStrip(s)
    {
        return s.replace(/\'/g, "''");
    }
};