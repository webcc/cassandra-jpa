"use strict";
let err = require("./errors");
let TimeUuid = require('cassandra-driver').types.TimeUuid;
module.exports = class PersistenceUtils {
    static toTimeUuid(value)
    {
        if (typeof value === "object")
        {
            if (value instanceof Date)
            {
                return TimeUuid.fromDate(value);
            }
            else
            {
                let isDate = Date.parse(value);
                if (isDate)
                {
                    value = TimeUuid.fromDate(value);
                }
                else
                {
                    value = TimeUuid.fromString(value);
                }
            }
        }
        else if (typeof value === "string")
        {
            return TimeUuid.fromString(value);
        }
        else
        {
            throw new TypeError("Invalid property type");
        }
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