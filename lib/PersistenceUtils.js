"use strict";
let err = require("./errors");
let t = require("typly").instance();
let TimeUuid = require('cassandra-driver').types.TimeUuid;
module.exports = class PersistenceUtils {
    static toTimeUuid(value)
    {
        t.assertNotNull(value);
        if (t.isObject(value))
        {
            if (value instanceof TimeUuid)
            {
                return value;
            }
            if (t.isDate(value))
            {
                return TimeUuid.fromDate(value);
            }
            else
            {
                throw new RangeError("Invalid object");
            }
        }
        else if (t.isString(value))
        {
            if (t.isUUID(value))
            {
                return TimeUuid.fromString(value);
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
};