"use strict";
let TimeUuid = require('cassandra-driver').types.TimeUuid;
module.exports = class CassandraEntity {
    constructor(config)
    {
        this.initDefaults();
        this.init(config);
    }

    initDefaults()
    {
        this[Symbol("CassandraEntity")] = "CassandraEntity";
        this.id = TimeUuid.now().toString();
    }

    set id(x)
    {
        if (typeof x !== "string")
        {
            throw new TypeError("Invalid id type " + x);
        }
        this._id = x;
    }

    get id()
    {
        return this._id;
    }

    toJSON()
    {
        let obj = {};
        Object.keys(this).map(key =>
        {
            if (key.charAt(0) === "_")
            {
                let newKey = key.substring(1);
                let property = this[key];
                if (property == null)
                {
                    obj[newKey] = null;
                }
                else if (property instanceof CassandraEntity)
                {
                    obj[newKey] = property;
                }
                else if (property instanceof Map)
                {
                    let arr = [];
                    for (let pair of property)
                    {
                        let o = {
                            key: pair[0],
                            value: pair[1]
                        };
                        arr.push(o);
                    }
                    obj[newKey] = arr;
                }
                else if (Array.isArray(property))
                {
                    obj[newKey] = this[key];
                }
                else if (property[Symbol.iterator] && typeof property === "object")
                {
                    throw new RangeError("Unknown collection to toJSON for " + property);
                }
                else
                {
                    obj[newKey] = this[key];
                }
            }
        });
        return obj;
    }

    clone()
    {
        return new this.constructor(this);
    }

    init(config)
    {
        if (typeof config === "object" && config !== null)
        {
            Object.keys(this).forEach(key =>
            {
                key = key.substring(1);
                let configProperty = config[key];
                if (typeof configProperty !== "undefined" && configProperty !== null)
                {
                    this[key] = configProperty;
                }
            });
        }
    }
};