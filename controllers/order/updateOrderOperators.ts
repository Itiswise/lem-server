import { Request, Response, NextFunction } from "express";
import { Order } from "../../models/order";
import { VALID_POSITIONS, operatorsAttr } from "../../models/order";

export const updateOrderOperators = function (
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const orderNumber = req.params.dashedordernumber.replace(/-/g, "/");
    const operators = req.body.operators;

    if (!orderNumber || !operators) {
        res.status(422).send({
            error: "Not enough values!",
        });
        return;
    }

    if (!Array.isArray(operators)) {
        res.status(422).send({
            error: "Operators must be an array!",
        });
        return;
    }

    if (operators.length !== 3) {
        res.status(422).send({
            error: "Operators array must contain exactly 3 operators!",
        });
        return;
    }

    const isValid = operators.every((op): op is operatorsAttr => {
        return (
            typeof op === "object" &&
            VALID_POSITIONS.includes(op.position) &&
            (op.operator === null || (typeof op.operator === "string" && op.operator.trim().length > 0))
        );
    });

    if (!isValid) {
        res.status(422).send({ error: "Invalid operators data!" });
        return;
    }

    const positions = operators.map((op: any) => op.position);
    if (new Set(positions).size !== positions.length) {
        res.status(422).send({
            error: "Operators array contains duplicate positions!",
        });
        return;
    }

    const operatorNames = operators.map((op: any) => op.operator);
    if (new Set(operatorNames).size !== operatorNames.length) {
        res.status(422).send({
            error: "Operators array contains duplicate operator names!",
        });
        return;
    }

    try {
        Order.findOneAndUpdate(
            { orderNumber },
            { operators },
            { new: true, upsert: false, runValidators: true },
            function (err, existingOrder) {
                if (err) {
                    return next(err);
                } else if (!existingOrder) {
                    return res.status(422).send({ error: "Order does not exist!" });
                } else {
                    res.json({
                        existingOrder,
                    });
                }
            }
        );
    } catch (error) {
        return next(error);
    }
}