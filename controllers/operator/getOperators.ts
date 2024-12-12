import { Request, Response, NextFunction } from "express";
import { Operator } from "../../models/operator";

export const getOperators = async function (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const startIndex = (page - 1) * limit;

        const operators = await Operator.find().sort({ _id: -1 }).skip(startIndex).limit(limit);

        const total = await Operator.countDocuments();

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