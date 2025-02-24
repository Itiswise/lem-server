import { Request, Response, NextFunction } from "express";
import { Order } from "../../models/order";
import { validateOperators } from "../../services/operatorsValidation";

export const deleteOrderOperators = function (
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
        Order.findOne({ orderNumber }, function (err, existingOrder) {
            if (err) {
                return next(err);
            }

            if (!existingOrder) {
                return res.status(422).send({ error: "Order does not exist!" });
            }

            if (existingOrder.orderStatus !== 'closed') {
                return res.status(422).send({ error: "Order is not closed!" });
            }

            existingOrder.operators = [];

            existingOrder.save(function (err) {
                if (err) {
                    return next(err);
                }

                res.json({
                    message: `Deleted operators from order no. ${existingOrder.orderNumber}`,
                });
            });
        })
    } catch (error) {
        return next(error);
    }
}