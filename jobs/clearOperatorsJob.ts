import { Order } from "../models/order";
import { Logger } from "winston";

export const clearOperatorsJob = async (logger: Logger, limit = 100): Promise<void> => {
    try {
        const ordersToUpdate = await Order.find(
            { orderStatus: "closed", operators: { $ne: [] } },
        )
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("_id");

        if (!ordersToUpdate.length) {
            logger.info("No closed orders needed operator cleanup.");
            return;
        }

        const result = await Order.updateMany(
            { _id: { $in: ordersToUpdate.map(order => order._id) } },
            { $set: { operators: [] } }
        );

        logger.info(`Cleared operators for ${result.modifiedCount} closed orders.`);
    } catch (error) {
        logger.error(`Error clearing operators: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
};