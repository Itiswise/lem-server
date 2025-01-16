import { Order } from "../models/order";
import { Line } from "../models/line";
import { Break } from "../models/break";
import { Logger } from "winston";

const handleOrderBreak = async (line: any, logger: Logger): Promise<void> => {
    const { lineOccupiedWith } = line;

    try {
        const order = await Order.findOne({
            orderNumber: lineOccupiedWith,
        });

        if (!order) {
            logger.warn(`No order found for order number: ${lineOccupiedWith}`);
            return;
        }

        const { breaks, operators } = order;

        if (!operators || !operators?.length) {
            logger.info(`No operators found for order: ${lineOccupiedWith}`);
            return;
        }

        const orderLineId = line._id;

        await Promise.all(breaks.map(async (breakItem) => {
            const breakModel = await Break.findOne({ _id: breakItem._id, _line: orderLineId });
            if (breakModel && !breakModel.breakEnd) {
                breakModel.breakEnd = new Date();
                await breakModel.save();
            }
        }));

        const newBreak = new Break({
            breakStart: new Date(),
            _line: orderLineId,
        });
        await newBreak.save();

        await order.updateOne({
            breaks: [...breaks, newBreak],
            operators: [],
        });

        logger.info(`Break successfully added to order: ${lineOccupiedWith}`);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error handling break for order ${lineOccupiedWith}: ${error.message}`);
        } else {
            logger.error(`Unknown error handling break for order ${lineOccupiedWith}: ${JSON.stringify(error)}`);
        }
    }
};

export const pauseOrdersJob = async (logger: Logger): Promise<void> => {
    try {
        const lines = await Line.find({ lineStatus: { $ne: "free" } });

        if (!lines.length) {
            logger.info("No occupied lines found to process.");
            return;
        }

        await Promise.all(lines.map((line) => handleOrderBreak(line, logger)));

        logger.info("All occupied lines have been processed.");
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error in pauseOrdersJob: ${error.message}`);
        } else {
            logger.error(`Unknown error in pauseOrdersJob: ${JSON.stringify(error)}`);
        }
    }
};