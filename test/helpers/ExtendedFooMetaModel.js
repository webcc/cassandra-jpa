"use strict";
const FooMetaModel = require("./FooMetaModel");
const Foo = require("./Foo");
module.exports = class ExtendedFooMetaModel extends FooMetaModel {
    constructor(jpaConfig)
    { 
        super(jpaConfig);
        this.name = "extendedFoo";
        this.entityClass = Foo;
        // add the extra field to the db schema
        this.fields.set("newField", "text");
        // allow for taking into account when querying
        this.extraParams.set("newField", null);
    }
};