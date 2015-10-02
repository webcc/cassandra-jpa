"use strict";
//see https://docs.oracle.com/javaee/6/api/javax/persistence/criteria/CriteriaBuilder.html
let CriteriaQuery = require("./CriteriaQuery");
module.exports = class CriteriaBuilder {
    constructor(metaModel)
    {
        this.metaModel = metaModel;
    }

    createQuery(metaModel)
    {
        metaModel = metaModel || this.metaModel;
        return new CriteriaQuery(metaModel);
    }

    and(expressions)
    {
        let q = "";
        if (Array.isArray(expressions))
        {
            let count = expressions.length;
            for (let expr of expressions)
            {
                q = q + expr + " ";
                if (count > 1)
                {
                    q = q + " AND ";
                }
                count--;
            }
        }
        return q;
    }

    //    Tests whether two expressions are equal
    equal(x, y)
    {
        return CriteriaBuilder.doOp(x, y, "=");
    }

    //Tests whether the first numeric expression is greater than the second numeric expression
    gt(x, y)
    {
        return CriteriaBuilder.doOp(x, y, ">");
    }

    //Tests whether the first numeric expression is greater than or equal to the second numeric
    // expression
    ge(x, y)
    {
        return CriteriaBuilder.doOp(x, y, ">=");
    }

    //Tests whether the first numeric expression is less than the second numeric expression
    lt(x, y)
    {
        return CriteriaBuilder.doOp(x, y, "<");
    }

    //Tests whether the first numeric expression is less than or equal to the second numeric
    // expression
    le(x, y)
    {
        return CriteriaBuilder.doOp(x, y, "<=");
    }

    static doOp(x, y, op)
    {
        if (typeof y === "string")
        {
            return "\"" + x + "\"" + op + "'" + y + "'";
        }
        return "\"" + x + "\"" + "=" + y;
    }
};