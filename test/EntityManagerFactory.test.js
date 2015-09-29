"use strict";
let assert = require("assert");
let m = require("..");
describe("cassandra-persistence", function ()
{
    describe("#EntityManagerFactoryTest", function ()
    {
        it("should initiate EntityManagerFactory", function ()
        {
            let config = require("./config/config.js");
            config.cassandra.contactPoints = [ process.env.DBHOST || config.cassandra.contactPoints[0] ];
            let emFactory = m.Persistence.createEntityManagerFactory("Foo", config);
            let entityManager = emFactory.createEntityManager();
            assert.equal(entityManager instanceof m.EntityManager, true);
        });
    });
});