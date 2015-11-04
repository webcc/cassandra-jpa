"use strict";
let FooMetaModel = require("./FooMetaModel");
let Foo = require("./Foo");
module.exports = class ExtendedFooMetaModel extends FooMetaModel {
    constructor(jpaConfig)
    { 
        super(jpaConfig);
        this.name = "extendedFoo";
        this.fields.set("newField", "text");
        this.entityClass = Foo;
        this.paramsObject = {
            newField: null
        }
    }

    toRow(entity)
    {
        return super.toRow(entity);
    }

    fromRow(row)
    {
        return super.fromRow(row);
    }
};