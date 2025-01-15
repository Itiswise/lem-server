import mongoose from "mongoose";
import { breakSchema, BreakAttrs } from "./break";
import { scanSchema, ScanAttrs } from "./scan";
import {ValidOperators} from "../services/operatorsConfig";

export interface OrderAttrs {
  orderNumber: string;
  quantity: number;
  partNumber: string;
  qrCode: string;
  tactTime: number;
  customer: string;
  orderStatus: string;
  orderAddedAt: Date;
  breaks: BreakAttrs[];
  scans: ScanAttrs[];
  operators?: ValidOperators;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

export interface OrderDoc extends mongoose.Document {
  orderNumber: string;
  quantity: number;
  partNumber: string;
  qrCode: string;
  tactTime: number;
  customer: string;
  orderStatus: string;
  orderAddedAt: Date;
  breaks: BreakAttrs[];
  scans: ScanAttrs[];
  operators?: ValidOperators;
}

export const operatorSchema = new mongoose.Schema({
  position: {
    type: Number,
    required: true,
  },
  operator: { type: String, required: false },
});

export const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  quantity: { type: Number, required: true },
  partNumber: { type: String, required: true, index: true },
  qrCode: { type: String, required: true },
  tactTime: { type: Number },
  customer: { type: String },
  orderStatus: { type: String, required: true, default: "open", index: true },
  orderAddedAt: { type: Date, default: Date.now },
  breaks: [breakSchema],
  scans: [scanSchema],
  operators: {
    type: [operatorSchema],
    validate: {
      validator: function (operators: any[]) {
        if (!operators) return true;

        const positions = operators.map((op) => op.position);
        if (new Set(positions).size !== positions.length) {
          return false;
        }

        const operatorNames = operators.map((op) => op.operator).filter((name) => name !== null);
        return new Set(operatorNames).size === operatorNames.length;
      },
      message: "Each operator must have both position and operator",
    },
    required: false,
  },
});

export const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);
