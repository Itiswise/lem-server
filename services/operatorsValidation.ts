import {POSITION_ENUM, ValidOperators, operatorsAttr} from "./operatorsConfig";

export const validateOperators = (operators: ValidOperators): { valid: boolean; error?: string } => {
    if (!Array.isArray(operators)) {
        return { valid: false, error: "Operators must be an array!" };
    }

    if (operators.length !== POSITION_ENUM.length) {
        return { valid: false, error: "Operators array must contain exactly 3 operators!" };
    }

    const isValidStructure = operators.every((op: any): op is operatorsAttr => {
        return (
            typeof op === "object" &&
            POSITION_ENUM.includes(op.position) &&
            (op.operator === null || (typeof op.operator === "string" && op.operator.trim().length > 0))
        );
    });

    if (!isValidStructure) {
        return { valid: false, error: "Invalid operators data!" };
    }

    const positions = operators.map((op: any) => op.position);
    if (new Set(positions).size !== positions.length) {
        return { valid: false, error: "Operators array contains duplicate positions!" };
    }

    const operatorNames = operators
        .map((op: any) => op.operator)
        .filter((name) => name !== null);
    if (new Set(operatorNames).size !== operatorNames.length) {
        return { valid: false, error: "Operators array contains duplicate operator names!" };
    }

    return { valid: true };
};
