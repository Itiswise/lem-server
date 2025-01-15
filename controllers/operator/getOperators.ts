import { Request, Response, NextFunction } from "express";
import { Operator } from "../../models/operator";
import { Order } from "../../models/order";

export const getOperators = async function (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const omitInOrders = req.query.omitInOrders === "true";
        const orderNumber = req.query.orderNumber as string;
        const startIndex = (page - 1) * limit;

        let operatorsQuery = Operator.find();

        if (omitInOrders) {
            const operatorIdsInOrders = await Order.distinct("operators.operator");

            if (orderNumber) {
                const currentOrder = await Order.findOne({ orderNumber }, { operators: 1 });
                const currentOrderOperatorIds = currentOrder?.operators?.map((op: { operator: any; }) => op.operator) || [];
                const operatorIdsToExclude = operatorIdsInOrders.filter(
                    (id) => !currentOrderOperatorIds.includes(id.toString())
                );

                operatorsQuery = operatorsQuery.where("_id").nin(operatorIdsToExclude);
            } else {
                operatorsQuery = operatorsQuery.where("_id").nin(operatorIdsInOrders);
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