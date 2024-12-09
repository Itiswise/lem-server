export type ValidOperators = [operatorsAttr, operatorsAttr, operatorsAttr];

export type ValidPosition = 1 | 2 | 3;
export const POSITION_ENUM = [1, 2, 3];

export interface operatorsAttr {
    position: ValidPosition;
    operator: string | null;
}

export const positionMap: Record<ValidPosition, string> = {
    1: "Stanowisko 1",
    2: "Stanowisko 2",
    3: "Stanowisko 3",
};