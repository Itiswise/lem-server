import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Product } from "../../models/product";
import {ProductStatistics} from "../../models/productStatistics";
import {Order} from "../../models/order";

const ObjectId = Types.ObjectId;
export const deleteProductStats = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const _id = req.params._id;

    if (!_id) {
      res.status(422).send({
        error: "You must provide product id!",
      });
      return;
    }

    if (!ObjectId.isValid(_id)) {
      res.status(422).send({
        error: "Invalid id!",
      });
      return;
    }

    ProductStatistics.findOne({ _id: _id }, function (err, existingProduct) {
        if (err) {
          return next(err);
        }

        Order.exists({ partNumber: { $regex: existingProduct?.partNumber, $options: "i" } }, function(err, result) {
          if (err) {
            return next(err);
          }

          if (result) {
            res.status(422).send({ error: "Can not delete this partnumber!" });
          } else {
            existingProduct?.remove();
            res.json({message: 'Deleted'});
          }
        });
    });
  } catch (error) {
    return next(error);
  }
};
