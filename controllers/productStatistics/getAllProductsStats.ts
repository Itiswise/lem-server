import { Request, Response, NextFunction } from "express";
import { ProductStatistics } from "../../models/productStatistics";

export const getAllProductsStats = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  var limit = typeof req.query.limit === "string" ? parseInt(req.query.limit) : 0;
  var skip = typeof req.query.skip === "string" ? parseInt(req.query.skip) : 0;
  var search = typeof req.query.search === "string" ? req.query.search : "";
  var params = { partNumber: { $regex: search, $options: "i", $ne : null }};

  ProductStatistics.find(params, function (err, productsStats) {
    if (err) {
      return next(err);
    }

    try {
      ProductStatistics.countDocuments(params, (err, count) => {
        if (err) {
          return next(err);
        }

        res.send({partnumbers: productsStats, allPartnumbersCount: count});
      });
    }
    catch (err) {
      return next(err);
    }
  }).limit(limit).skip(skip).sort({ partNumber: 1 });
};
