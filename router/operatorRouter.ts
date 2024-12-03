import { Express } from "express";
import { OperatorController } from "../controllers";
import { requireAuth } from "../services/requireAuth";

export const operatorRouter = function (app: Express) {
    app.get("api/operator", requireAuth, OperatorController.getOperators);
    app.get("/api/operator/:_id", requireAuth, OperatorController.getOperator);
    app.post("/api/operator", requireAuth, OperatorController.addOperator);
    app.put("/api/operator/:_id", requireAuth, OperatorController.changeOperator);
    app.delete("/api/operator/:_id", requireAuth, OperatorController.deleteOperator);
};
