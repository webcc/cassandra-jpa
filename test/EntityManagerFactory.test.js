"use strict";

describe("cassandra-jpa::EntityManagerFactory", function ()
{
    const assert = require("assert");
    const cassandra = require('cassandra-driver');
    const m = require("..");
    const uuid = require('uuid');
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