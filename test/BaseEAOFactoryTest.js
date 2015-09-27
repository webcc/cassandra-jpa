"use strict";
let assert = require("assert");
let BaseEAO = require("../lib/EntityManager");
let BaseEAOFactory = require("../lib/BaseEAOFactory");
let JPAConfiguration = require("../lib/JPAConfiguration");
let config = new JPAConfiguration();
describe("cassandra-persistence", function ()
{ 
    describe("#BaseEAOFactory", function ()
    {
        it("should initiate BaseEAO", function (done)
        {
            let factory = new BaseEAOFactory(config);
            assert.equal(factory instanceof BaseEAOFactory, true);
            assert.equal(factory.getBaseEAO() instanceof BaseEAO, true);
            done();
        }); 
    }); 
});