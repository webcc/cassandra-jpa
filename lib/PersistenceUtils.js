"use strict";
let err = require("./errors");
let typly = require("typly").instance();
let TimeUuid = require('cassandra-driver').types.TimeUuid;
module.exports = class PersistenceUtils {
    static toTimeUuid(value)
    {
        typly.assertNotNull(value);
        if (typly.isObject(value))
        {
            if (value instanceof TimeUuid)
            {
                return value;
            }
            if (typly.isDate(value))
            {
                return TimeUuid.fromDate(value);
            }
            else
            {
                throw new RangeError("Invalid object");
            }
        }
        else if (typly.isString(value))
        {
            if (typly.isUUID(value))
            {
                return TimeUuid.fromString(value);
            }
            else if (typly.isDateString(value) )
            {
                return TimeUuid.fromDate(new Date(value));
            }
            else
            {
                throw new RangeError("Invalid UUID format " + value);
            }
        }
        else
        {
            throw new TypeError("Invalid type");
        }
    }

    static clone(entity)
    {
        return new entity.constructor(entity);
    }

    static bindToJSON(entity)
    {
        if (entity.toJSON !== "function")
        {
            entity.toJSON = function toJSON()
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
                        else if (typeof property === "object")
                        {
                            obj[newKey] = property;
                        }
                        else if (property instanceof Map)
                        {
                            let arr = [];
                            for (let pair of property)
                            {
                                let o = [pair[0], pair[1]];
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
                    else
                    {
                        obj[key] = this[key];
                    }
                });
                return obj;
            };
        }
        return entity;
    }

    static removeUnderScore(entity)
    {
        let obj = Object.assign({}, entity);
        Object.keys(entity).map(key =>
        {
            if (key.charAt(0) === "_")
            {
                let newKey = key.substring(1);
                obj[newKey] = obj[key];
                delete obj[key];
            }
        });
        return obj;
    }
};