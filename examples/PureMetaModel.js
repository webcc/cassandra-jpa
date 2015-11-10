"use strict";
let MetaModel = require("../lib/MetaModel");
module.exports = class PureMetaModel extends MetaModel {
    constructor(jpaConfig)
    { 
        super(jpaConfig);
        this.name = "pure";
        this.fields = new Map([
            ["id", "timeuuid"],
            ["name", "text"]
        ]);
        this.partitionKeys = ["id"];
        this.clusteringColumns = new Map([["name", "ASC"]]);
        this.secondaryIndexes = ["name"];
    }
};