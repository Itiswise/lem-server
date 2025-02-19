import mongoose from "mongoose";

export interface OperatorAttrs {
    _id?: mongoose.Schema.Types.ObjectId;
    firstname?: string;
    lastname?: string;
    identifier: string;
    _line?: mongoose.Schema.Types.ObjectId;
}

interface OperatorModel extends mongoose.Model<OperatorDoc> {
    build(attrs: OperatorAttrs): OperatorDoc;
}

interface OperatorDoc extends mongoose.Document {
    _id: mongoose.Schema.Types.ObjectId;
    firstname?: string;
    lastname?: string;
    identifier?: string;
    _line?: mongoose.Schema.Types.ObjectId;
}

export const operatorSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    identifier: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    _line: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Line",
        required: false,
    },
});

export const Operator = mongoose.model<OperatorDoc, OperatorModel>(
    "Operator",
    operatorSchema
);