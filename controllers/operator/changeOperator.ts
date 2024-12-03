import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Operator } from "../../models/operator";

const ObjectId = Types.ObjectId;

export const changeOperator = function (
    req: Request,
    res: Response,
    next: NextFunction
): void {
    try {
        const _id = req.params._id;
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const email = req.body.email;

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

        Operator.findByIdAndUpdate(
            _id,
            { firstname, lastname, email },
            { new: true, upsert: false, runValidators: true },
            function(err, existingOperator) {
            if (err) {
                return next(err);
            } else if (!existingOperator) {
                return res.status(422).send({ error: "Operator does not exist!" });
            } else {
                res.json({
                    existingOperator,
                })
            }
        })

    } catch (error) {
        return next(error);
    }
}