import { Request, Response, NextFunction } from "express";
import { Operator } from "../../models/operator";

export const addOperator = function (
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;

    if (!email || !firstname || !lastname) {
        res.status(422).send({
            error:
                "You must provide firstname, lastname and email",
        });
        return;
    }

    Operator.findOne({ email }, function (err, existingOperator) {
        if (err) {
            return next(err);
        }

        if (existingOperator) {
            return res.status(422).send({ error: "Operator already exists with this email" });
        }

        const operator = new Operator({
            firstname,
            lastname,
            email,
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