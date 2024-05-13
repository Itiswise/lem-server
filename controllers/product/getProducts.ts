import { Request, Response, NextFunction } from "express";
import { Product } from "../../models/product";

export const getProducts = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  var limit = typeof req.query.limit === "string" ? parseInt(req.query.limit) : 0;
  var skip = typeof req.query.skip === "string" ? parseInt(req.query.skip) : 0;
  var search = typeof req.query.search === "string" ? req.query.search : "";
  var params = { partNumber: { $regex: search, $options: "i", $ne : null }};

  Product.find(params, "partNumber", function (err, products) {
    if (err) {
      return next(err);
    }

    try {
      Product.countDocuments(params, (err, count) => {
        if (err) {
          return next(err);
        }

        res.json({ products: products, allProductsCount: count });
      });
    }
    catch (err) {
      return next(err);
    }
  }).limit(limit).skip(skip).sort({ partNumber: 1 });
};
