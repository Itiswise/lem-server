import mongoose from "mongoose";

export interface OperatorAttrs {
    _id?: mongoose.Schema.Types.ObjectId;
    firstname?: string;
    lastname?: string;
    email?: string;
}

interface OperatorModel extends mongoose.Model<OperatorDoc> {
    build(attrs: OperatorAttrs): OperatorDoc;
}

interface OperatorDoc extends mongoose.Document {
    _id: mongoose.Schema.Types.ObjectId;
    firstname?: string;
    lastname?: string;
    email?: string;
}

export const operatorSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
    },
});

export const Operator = mongoose.model<OperatorDoc, OperatorModel>(
    "Operator",
    operatorSchema
);
