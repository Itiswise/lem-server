import { Request, Response, NextFunction } from "express";
import { Order } from "../../models/order";
import { Line } from "../../models/line";
import { getOrderDetails } from "../../services/getOrderDetails";
import { addOrUpdateOneOrderStatistics } from "../orderStatistics";
import { validateOperators } from "../../services/operatorsValidation";

export const addOrder = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const orderNumber = req.body.orderNumber;
  const quantity = req.body.quantity;
  const partNumber = req.body.partNumber;
  const qrCode = req.body.qrCode;
  const tactTime = req.body.tactTime || 36000; // 10 hours
  const customer = req.body.customer;
  const orderStatus = "open";
  const operators = req.body.operators || null;

  if (
    !orderNumber ||
    !quantity ||
    !partNumber ||
    !qrCode ||
    !tactTime ||
    !customer
  ) {
    res.status(422).send({
      error: "Not enough values!",
    });
    return;
  }

  if (operators) {
    const { valid, error } = validateOperators(operators);
    if (!valid) {
      res.status(422).send({
        error,
      });
      return;
    }
  }

  Line.find({}, function (err, lines) {
    if (err) {
      return next(err);
    }

    Order.findOne({ orderNumber: orderNumber }, function (err, existingOrder) {
      if (err) {
        return next(err);
      }

      if (existingOrder) {
        return res.status(422).send({ error: "Order exists" });
      }

      const order = new Order({
        orderNumber,
        quantity,
        partNumber,
        qrCode,
        customer,
        tactTime,
        orderStatus,
        breaks: [],
        scans: [],
        ...(operators && { operators }),
      });

      order.save(function (err) {
        if (err) {
          return next(err);
        }

        async function handleStatistics() {
          const orderDetails = getOrderDetails(order, lines);

          const {
            orderNumber,
            _id,
            partNumber,
            orderStatus,
            quantity,
            orderAddedAt,
            lastValidScan,
            scansAlready,
            validScans,
            linesUsed,
            netTime,
            grossTime,
            absoluteTime,
            meanCycleTime,
            meanCycleTimeInMilliseconds,
            meanHourlyRate,
            meanGrossHourlyRate,
            givenHourlyRate,
            givenTactTime,
            xlsxTactTime,
          } = orderDetails;

          const orderStats = await addOrUpdateOneOrderStatistics({
            orderNumber,
            _orderId: _id,
            partNumber,
            orderStatus,
            quantity,
            orderAddedAt,
            lastValidScan: lastValidScan(),
            scansAlready: scansAlready(),
            validScans: validScans(),
            linesUsed: linesUsed(),
            netTime: netTime(),
            grossTime: grossTime(),
            absoluteTime: absoluteTime(),
            meanCycleTime: meanCycleTime(),
            meanCycleTimeInMilliseconds: meanCycleTimeInMilliseconds(),
            meanHourlyRate: meanHourlyRate(),
            meanGrossHourlyRate: meanGrossHourlyRate(),
            givenHourlyRate,
            givenTactTime,
            xlsxTactTime,
          });

          await res.json({
            orderStats,
            order,
          });
        }

        handleStatistics();
      });
    });
  });
};
