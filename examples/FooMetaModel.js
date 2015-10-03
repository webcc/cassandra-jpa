"use strict";
let m = require("..");
let Foo = require("./Foo");
module.exports = class FooMetaModel extends m.MetaModel {
    constructor(keySpace)
    {
        super({});
        this.keySpace = keySpace;
        this.name = "foo";
        this.fields = new Map([["id", "timeuuid"], ["name", "text"], ["created", "timeuuid"],
            ["entity", "text"], ["entities", "list<text>"], ["simpleObjects", "list<text>"],
            ["enabled", "boolean"]]);
        this.partitionKeys = ["id"];
        this.clusteringColumns = new Map([["name", "ASC"]]);
        this.secondaryIndexes = ["name"];
        this.entityClass = Foo;
        this.ttl = 5000; // if not, set undefined
    }

    toRow(entity)
    {
        return super.toRow(entity);
    }

    fromRow(row)
    {
        let entity = super.fromRow(row);
        entity.entity = new m.Entity(JSON.parse(JSON.stringify(row.entity)));
        entity.entities = [];
        if (row.entities)
        {
            row.entities.forEach(function (element, index, array)
            {
                let e = new m.Entity(JSON.parse(JSON.stringify(element)));
                entity.entities.push(e);
            });
        }
        return entity;
    }
};