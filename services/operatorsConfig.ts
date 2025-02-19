import mongoose from "mongoose";

export type ValidOperators = operatorsAttr[] | [];
export type ValidScanOperators = scanOperatorsAttr[] | [];

export interface operatorsAttr {
    position: number;
    operator: string | null;
    _line?: mongoose.Schema.Types.ObjectId;
}

export interface scanOperatorsAttr {
    position: number;
    firstName: string;
    lastName: string;
    identifier: string;
    _line?: mongoose.Schema.Types.ObjectId;
}