import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Operator } from "../../models/operator";
import { Order } from "../../models/order";
import {createLogger} from "../../logger";

const logger = createLogger();

const ObjectId = Types.ObjectId;

export const deleteOperator = async function (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const _id = req.params._id;

        if (!_id) {
            res.status(422).send({
                error: "You must provide operator id!",
            });
            return;
        }

        if (!ObjectId.isValid(_id)) {
            res.status(422).send({
                error: "Invalid id!",
            });
            return;
        }

        const isDeleteable = await canDeleteOperator(_id);

        if (!isDeleteable) {
            res.status(422).send({
                error: "Operator is currently assigned to an active order!"
            });
            return;
        }

        Operator.findByIdAndRemove(_id, async function (err, existingOperator) {
            if (err) {
                return next(err);
            } else if (!existingOperator) {
                return res.status(422).send({ error: "Operator does not exist!" });
            } else {
                const result = await Order.updateMany(
                    { "operators.operator": existingOperator._id },
                    { $pull: { operators: { operator: existingOperator._id } } }
                );

                if (!result) {
                    return res.status(422).send({ error: "Failed to delete operator from orders!" });
                }

                const message = `Deleted operator with identifier - ${existingOperator.identifier}`;

                logger.info(message);

                res.json({
                    message,
                });
            }
        });

    } catch (error) {
        return next(error);
    }
}

const canDeleteOperator = async function(operatorId: string): Promise<boolean> {
    const existingOperator = await Operator.findById(operatorId);
    if (!existingOperator) {
        return false;
    }

    const openOrders = await Order.find({
        orderStatus: "open",
        operators: { $elemMatch: { operator: operatorId } }
    });

    if (openOrders.length === 0) {
        return true;
    }

    return openOrders.some(order => {
        const breaks = order.breaks;
        if (breaks.length === 0) {
            return false;
        }
        const lastBreak = breaks[breaks.length - 1];
        return !lastBreak.breakEnd;
    });
}