"use strict";
let MetaModel = require("./MetaModel");
let fooMetaModel = new MetaModel({
    keySpace: "imergo_test",
    name: "foo",
    fields: new Map([["id", "timeuuid"], ["name", "text"], ["created", "timeuuid"],
        ["entity", "text"], ["entities", "list<text>"], ["simpleObjects", "list<text>"],
        ["enabled", "boolean"]]),
    partitionKeys: ["id"],
    clusteringColumns: new Map([["name", "ASC"]]),
    secondaryIndexes: ["name"],
    entityClass: Foo
}); 
module.exports = fooMetaModel;