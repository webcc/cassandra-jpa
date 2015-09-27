"use strict";
let assert = require("assert");
let Foo = require("../examples/Foo");
let m = require("..");
let Persistence = require("./Persistence");
let fooMetaModel = require("../examples/FooMetaModel");
describe("cassandra-persistence", function ()
{
    describe("#JPATest", function ()
    {
        let entityManager;
        it("should initiate JPA", function ()
        {
            let emFactory = Persistence.createEntityManagerFactory("Foo", config);
            entityManager = emFactory.createEntityManager();
        });
        it("should persist", function (done)
        {
            entityManager.persist(foo, fooMetaModel, function (error, result)
            {
                assert.equals(error, null);
                done();
            });
        });
        it("should criteria", function (done)
        {
            //let criteriaBuilder = entitymanager.getCriteriaBuilder();
            //let criteriaQuery = criteriaBuilder.createQuery();
            //let from = criteriaQuery.from(Foo);
            done();
        });
    });
});