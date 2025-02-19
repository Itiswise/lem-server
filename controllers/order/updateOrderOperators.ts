import { Request, Response, NextFunction } from "express";
import { Order } from "../../models/order";
import { validateOperators } from "../../services/operatorsValidation";
import {operatorsAttr} from "../../services/operatorsConfig";

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

    const { valid, error } = validateOperators(operators);
    if (!valid) {
        res.status(422).send({
            error,
        });
        return;
    }

    try {
        Order.findOneAndUpdate(
            { orderNumber },
            [
                {
                    $set: {
                        operators: {
                            $concatArrays: [
                                {
                                    $filter: {
                                        input: "$operators",
                                        as: "existingOp",
                                        cond: {
                                            $not: {
                                                $in: ["$$existingOp.operator", operators.map((op: any): op is operatorsAttr => op.operator)]
                                            }
                                        }
                                    }
                                },
                                operators
                            ]
                        }
                    }
                }
            ],
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