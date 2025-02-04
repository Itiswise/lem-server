import { Request, Response, NextFunction } from "express";
import { Operator } from "../../models/operator";
import { Order } from "../../models/order";
import mongoose from "mongoose";

export const getOperators = async function (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const omitInOrders = req.query.omitInOrders === "true";
        const productionLineId = req.query.productionLineId as string;
        const orderNumber = req.query.orderNumber as string;
        const startIndex = (page - 1) * limit;

        let operatorsQuery = Operator.find();

        if (omitInOrders && productionLineId) {
            const operatorIds: string[] = await Order.distinct("operators.operator") as string[];
            const lineOperatorIds: string[] = await Order.aggregate([
                { $unwind: "$operators" },
                { $match: { "operators._line": { $exists: true } } },
                { $group: { _id: "$operators.operator" } }
            ]).then(results => results.map(res => res._id.toString()));
            const existingOrder = await Order.findOne({ orderNumber });

            const ids = [...lineOperatorIds, ...operatorIds];

            if (existingOrder) {
                const operatorIdsInLine = await Order.aggregate([
                    { $unwind: "$operators" },
                    { $match: { "operators._line": new mongoose.Types.ObjectId(productionLineId) } },
                    { $group: { _id: "$operators.operator" } }
                ]).then(results => results.map(res => res._id.toString()));

                const operatorIdsInOrder = existingOrder.operators
                    ?.map((operator: { operator: any }) => operator.operator)
                    .filter(Boolean) || [];

                const filteredOperatorIds = operatorIds.filter(id => !operatorIdsInOrder.includes(id));
                const filterOperatorIdsByLine = lineOperatorIds.filter(id => !operatorIdsInLine.includes(id));

                const ids = [...filteredOperatorIds, ...filterOperatorIdsByLine];

                operatorsQuery = operatorsQuery
                    .where("_id").nin(ids);
            } else {
                operatorsQuery = operatorsQuery
                    .where("_id").nin(ids);
            }
        }

        const operators = await operatorsQuery.sort({ _id: -1 }).skip(startIndex).limit(limit);
        const total = await operatorsQuery.countDocuments();

        res.status(200).json({
            success: true,
            data: operators,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        next(error);
    }
}