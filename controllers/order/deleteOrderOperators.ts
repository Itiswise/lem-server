import { Request, Response, NextFunction } from "express";
import { Order } from "../../models/order";

export const deleteOrderOperators = async function (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const orderNumber = req.params.dashedordernumber.replace(/-/g, "/");

        if (!orderNumber) {
            res.status(422).send({
                error: "Not enough values!",
            });
            return;
        }

        const existingOrder = await Order.findOne({ orderNumber });

        if (!existingOrder) {
            res.status(422).send({ error: "Order does not exist!" });
            return;
        }

        if (existingOrder.orderStatus !== "closed") {
            res.status(422).send({ error: "Order is not closed!" });
            return;
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { orderNumber },
            { $set: { operators: [] } },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            res.status(500).send({ error: "Failed to update order!" });
            return;
        }

        res.json({
            message: `Deleted operators from order no. ${updatedOrder.orderNumber}`,
        });
    } catch (error) {
        next(error);
    }
};
