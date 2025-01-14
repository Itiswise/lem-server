import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Operator } from "../../models/operator";

const ObjectId = Types.ObjectId;

export const changeOperator = async function (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const _id = req.params._id;
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const identifier = req.body.identifier;

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

        const existingIdentifierOperators = await Operator.findOne({
            identifier,
            _id: { $ne: _id },
        });

        if (existingIdentifierOperators) {
            res.status(422).send({
                error: "Identifier is already in use by another operator!",
            });
            return;
        }

        Operator.findByIdAndUpdate(
            _id,
            { firstname, lastname, identifier },
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