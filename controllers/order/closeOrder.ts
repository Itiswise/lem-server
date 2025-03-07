import { Request, Response, NextFunction } from "express";
import { Order } from "../../models/order";

export const closeOrder = async function (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
  try {
    const orderNumber = req.body.orderNumber;

    if (!orderNumber) {
      res.status(422).send({
        error: "You must provide order number!",
      });
      return;
    }

    const existingOrder = await Order.findOne({ orderNumber });

    if (!existingOrder) {
      res.status(422).send({ error: "Order does not exist!" });
      return;
    }

    if (existingOrder.orderStatus === "closed") {
      res.status(422).send({ error: "Order is already closed!" });
      return;
    }

    if (existingOrder.orderStatus === "open") {
      const updatedOrder = await Order.findOneAndUpdate(
          { orderNumber },
          { $set: { orderStatus: "closed", operators: [] } },
          { new: true, runValidators: true }
      );

      if (!updatedOrder) {
        res.status(500).send({ error: "Failed to update order!" });
        return;
      }

      res.json({
        message: `Updated order no. ${updatedOrder.orderNumber} status to: ${updatedOrder.orderStatus}`,
      });
    } else {
      res.json({ message: "No changes were added" });
    }
  } catch (error) {
    next(error);
  }
};
