import mongoose from "mongoose";
import {operatorsAttr} from "./order";

export interface ScanAttrs {
  _id?: mongoose.Schema.Types.ObjectId;
  scanContent: string;
  timeStamp: Date;
  operators?: [operatorsAttr, operatorsAttr, operatorsAttr];
  errorCode?: string;
  _line?: mongoose.Schema.Types.ObjectId;
  _user?: mongoose.Schema.Types.ObjectId;
}

interface ScanModel extends mongoose.Model<ScanDoc> {
  build(attrs: ScanAttrs): ScanDoc;
}

export interface ScanDoc extends mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  scanContent: string;
  timeStamp: Date;
  operators?: [operatorsAttr, operatorsAttr, operatorsAttr];
  errorCode?: string;
  _line?: mongoose.Schema.Types.ObjectId;
  _user?: mongoose.Schema.Types.ObjectId;
}

export const scanSchema = new mongoose.Schema({
  scanContent: {
    type: String,
    required: true,
    index: true,
    sparse: true,
  },
  timeStamp: { type: Date, default: Date.now },
  operators: {
    type: [
      {
        position: { type: String, required: true },
        operator: { type: String, required: false },
      },
    ],
    required: false,
  },
  errorCode: {
    type: String,
    required: true,
    index: true,
    default: "e000",
  },
  _line: { type: mongoose.Schema.Types.ObjectId, ref: "Line" },
  _user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export const Scan = mongoose.model<ScanDoc, ScanModel>("Scan", scanSchema);
