"use strict";
let assert = require("assert");
let cassandra = require('cassandra-driver');
let m = require("..");
let uuid = require('uuid');

describe("cassandra-jpa::EntityManagerFactory", function ()
{
    it("should initiate EntityManagerFactory", function ()
    {
        let id = uuid.v1();
        let jpaConfig = new m.JPAConfiguration();
        let emFactory = m.Persistence.createEntityManagerFactory("Foo", jpaConfig);
        let entityManager = emFactory.createEntityManager();
        assert.equal(entityManager instanceof m.EntityManager, true);
        assert(m.Persistence.getPersistenceUnitUtils().toTimeUuid(id) instanceof cassandra.types.TimeUuid);
    });
});