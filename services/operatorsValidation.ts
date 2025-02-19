import { ValidOperators, operatorsAttr } from "./operatorsConfig";
import mongoose from "mongoose";

export const validateOperators = (operators: ValidOperators): { valid: boolean; error?: string } => {
    if (!Array.isArray(operators)) {
        return { valid: false, error: "Operators must be an array!" };
    }

    const isValidStructure = operators.every((op: any): op is operatorsAttr => {
        return (
            typeof op === "object" &&
            typeof op.operator === "string" &&
            mongoose.Types.ObjectId.isValid(op.operator) &&
            (op._line === undefined || mongoose.Types.ObjectId.isValid(op._line))
        );
    });

    if (!isValidStructure) {
        return { valid: false, error: "Invalid operators data!" };
    }

    const operatorIds = operators.map((op: any): op is operatorsAttr => op.operator);
    const hasDuplicates = new Set(operatorIds).size !== operatorIds.length;

    if (hasDuplicates) {
        return { valid: false, error: "Duplicate operators detected!" };
    }

    return { valid: true };
};