import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Operator } from "../../models/operator";

const ObjectId = Types.ObjectId;

export const deleteOperator = function (
    req: Request,
    res: Response,
    next: NextFunction
): void {
    try {
        const _id = req.params._id;

        if (!_id) {
            res.status(422).send({
                error: "You must provide operator id!",
            });
            return;
        }

        if (!ObjectId.isValid(_id)) {
            res.status(422).send({
                error: "Invalid id!",
            });
            return;
        }

        Operator.findByIdAndRemove(_id, function (err, existingOperator) {
            if (err) {
                return next(err);
            } else if (!existingOperator) {
                return res.status(422).send({ error: "Operator does not exist!" });
            } else {
                const message = `Deleted operator with email - ${existingOperator.email}`;

                res.json({
                    message,
                });
            }
        });

    } catch (error) {
        return next(error);
    }
}