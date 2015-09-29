"use strict";
let t = require("typly").instance();
let criterionType = require("./CriterionType");
let criterionTypes = criteriaTypeToArray(criterionType);
module.exports = class Criterion {
    constructor(key, value, type)
    {
        this.key = key;
        this.value = value;
        this.type = type || criterionType.EQUAL;
    }

    get key()
    {
        return this._key;
    }

    set key(value)
    {
        t.assertNotNull(value);
        t.assertString(value);
        this._key = value;
    }

    get value()
    {
        return this._value;
    }

    set value(value)
    {
        t.assertNotNull(value);
        this._value = value;
    }

    get type()
    {
        return this._type;
    }

    set type(value)
    {
        t.assertNotNull(value);
        t.assertString(value);
        if (criterionTypes.indexOf(value) < 0)
        {
            throw new RangeError("Unknown type " + value);
        }
        this._type = value;
    }

    static getTypes()
    {
        return criterionTypes;
    }

    static getCriterionType()
    {
        return criterionType;
    }
};
function criteriaTypeToArray(criterionType)
{
    let criterionTypes = [];
    for (let type in criterionType)
    {
        if (criterionType.hasOwnProperty(type))
        {
            criterionTypes.push(criterionType[type])
        }
    }
    return criterionTypes;
}