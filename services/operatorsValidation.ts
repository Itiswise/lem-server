import {ValidOperators, operatorsAttr} from "./operatorsConfig";
import mongoose from "mongoose";

export const validateOperators = (operators: ValidOperators): { valid: boolean; error?: string } => {
    if (!Array.isArray(operators)) {
        return { valid: false, error: "Operators must be an array!" };
    }

    const isValidStructure = operators.every((op: any): op is operatorsAttr => {
        return (
            typeof op === "object" &&
            typeof op.position === "number" &&
            typeof op.operator === "string" &&
            op.operator.trim().length > 0 &&
            (op._line === undefined || mongoose.Types.ObjectId.isValid(op._line))
        );
    });

    if (!isValidStructure) {
        return { valid: false, error: "Invalid operators data!" };
    }

    const positions = operators.map((op: any) => op.position);
    if (new Set(positions).size !== positions.length) {
        return { valid: false, error: "Operators array contains duplicate positions!" };
    }

    const operatorKeys = operators.map((op: any) => {
        const lineKey = op._line ? op._line.toString() : "";
        return `${lineKey}-${op.operator}`;
    });

    if (new Set(operatorKeys).size !== operatorKeys.length) {
        return {
            valid: false,
            error: "Operators array contains duplicate operator names for the same production line!",
        };
    }

    return { valid: true };
};
