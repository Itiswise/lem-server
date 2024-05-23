import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import {ProductStatistics, ProductStatisticsDoc} from "../../models/productStatistics";
import {ProductAttrs} from "../../models/product";

const ObjectId = Types.ObjectId;

export const addProdStatsForRouter = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const {
    givenHourlyRate,
    suggestedHourlyRate,
    givenTactTime,
    suggestedTactTime,
    xlsxTactTime,
    cleanRoomTime,
    automatic,
    partNumber,
  } = req.body;

  let data : ProductStatisticsDoc = {} as ProductStatisticsDoc;

  if (!partNumber) {
    res.status(422).send({ error: "You must provide part number name!" });
  }
    data.partNumber = partNumber;

  if (automatic) {
    data.automatic = automatic;
  }

  if (suggestedHourlyRate) {
    data.suggestedHourlyRate = parseInt(suggestedHourlyRate);
  }

  if (givenHourlyRate) {
    data.givenHourlyRate = parseInt(givenHourlyRate);
  }

  if (cleanRoomTime) {
    data.cleanRoomTime = parseInt(cleanRoomTime);
  }

  if (givenTactTime) {
    data.givenTactTime = parseInt(givenTactTime);
  }

  if (suggestedTactTime) {
    data.suggestedTactTime = parseInt(suggestedTactTime);
  }

  if (xlsxTactTime) {
    data.xlsxTactTime = parseInt(xlsxTactTime);
  }

  const product = new ProductStatistics(data);

  product.save(function (err) {
    if (err) {
      return next(err);
    }

    res.json({ product });
  });

};
