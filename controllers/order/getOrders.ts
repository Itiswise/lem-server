import { Request, Response, NextFunction } from "express";
import { Order } from "../../models/order";

export const getOrders = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  var limit = typeof req.query.limit === "string" ? parseInt(req.query.limit) : 0;
  var skip = typeof req.query.skip === "string" ? parseInt(req.query.skip) : 0;
  var column = typeof req.query.column === "string" ? req.query.column : 'orderAddedAt';
  var {
    orderAddedAt ,
    orderNumber,
    orderStatus,
    partNumber,
    quantity,
    order
  } = req.query;
  var params = {};

  if (orderAddedAt && typeof orderAddedAt === "string") {
    var date = orderAddedAt.replace(/\./g, "-");
    if (!isNaN(Date.parse(orderAddedAt))) {
      var from = new Date(date);
      var to = new Date(date);

      switch (date.split("-").length) {
        case 1:
          to.setFullYear(from.getFullYear() + 1);
          break;
        case 2:
          to.setMonth(from.getMonth() + 1);
          break;
        default:
          to.setDate(from.getDate() + 1);
          break;
      }

      params = { ...params, orderAddedAt: { $gte: from, $lt: to } };
    }
  }

  if (orderNumber && typeof orderNumber === "string") {
    params = { ...params, orderNumber: { $regex: orderNumber, $options: "i" } };
  }

  if (orderStatus && typeof orderStatus === "string") {
    params = { ...params, orderStatus: { $regex: orderStatus, $options: "i" } };
  }

  if (partNumber && typeof partNumber === "string") {
    params = { ...params, partNumber: { $regex: partNumber, $options: "i" } };
  }

  if (quantity && typeof quantity === "string") {
    params = { ...params, quantity: { $gte: parseInt(quantity), $lt: parseInt(quantity) + 1 } };
  }

  Order.find(
    params,
    "orderNumber orderStatus _id quantity partNumber qrCode orderAddedAt customer",
    function (err, orders) {
      if (err) {
        return next(err);
      }

      Order.countDocuments(params, (err, count) => {
        if (err) {
          return next(err);
        }

        res.json({ orders: orders, allOrdersCount: count });
      });

    }
  ).sort({ [column]: order === 'asc' ? 1 : -1 }).limit(limit).skip(skip);
};
