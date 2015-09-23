"use strict";
module.exports = class PersistenceError
{
    constructor(msg)
    {
        this.name = "IERROR.PERSISTENCE_ERROR";
        this.code = "1011";
        if (msg)
        {
            this.message += " " + msg;
        }
    }
};