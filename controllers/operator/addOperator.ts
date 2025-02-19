import { Request, Response, NextFunction } from "express";
import { Operator } from "../../models/operator";

export const addOperator = function (
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const identifier = req.body.identifier;

    if (!identifier || !firstname || !lastname) {
        res.status(422).send({
            error:
                "You must provide firstname, lastname and identifier",
        });
        return;
    }

    Operator.findOne({ identifier }, function (err, existingOperator) {
        if (err) {
            return next(err);
        }

        if (existingOperator) {
            return res.status(422).send({ error: "Operator already exists with this identifier" });
        }

        const operator = new Operator({
            firstname,
            lastname,
            identifier,
        });

        operator.save(function (err) {
            if (err) {
                return next(err);
            }

            res.json({
                operatorId: operator._id,
                operatorFirstName: operator.firstname,
                operatorLastName: operator.lastname,
            });
        });
    });
}