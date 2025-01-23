import { Order } from "../models/order";
import { Line } from "../models/line";
import { Break } from "../models/break";
import { Logger } from "winston";

const handleOrderBreak = async (lines: any[], order: any, logger: Logger): Promise<void> => {
    try {
        const updatedBreaks = [...order.breaks];

        for (const line of lines) {
            const orderLineId = line._id;

            for (const breakItem of order.breaks) {
                if (breakItem._line === orderLineId && !breakItem.breakEnd) {
                    const breakModel = await Break.findOne({ _id: breakItem._id, _line: orderLineId });

                    if (breakModel && !breakModel.breakEnd) {
                        breakModel.breakEnd = new Date();
                        await breakModel.save();

                        const existingBreak = updatedBreaks.find((b) => b._id.toString() === breakItem._id.toString());
                        if (existingBreak) {
                            existingBreak.breakEnd = breakModel.breakEnd;
                        }
                    }
                }
            }

            const newBreak = new Break({
                breakStart: new Date(),
                _line: orderLineId,
            });
            await newBreak.save();

            updatedBreaks.push({
                _id: newBreak._id,
                breakStart: newBreak.breakStart,
                _line: newBreak._line,
            });

            logger.info(`Break successfully added for line: ${orderLineId} in order: ${order.orderNumber}`);
        }

        await Order.updateOne(
            { _id: order._id },
            { $set: { breaks: updatedBreaks } }
        );
    } catch (error) {
        logger.error(`Error handling breaks for order ${order.orderNumber}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
};

export const pauseOrdersJob = async (logger: Logger): Promise<void> => {
    try {
        const lines = await Line.find({ lineStatus: { $ne: "free" } });

        if (!lines.length) {
            logger.info("No occupied lines found to process.");
            return;
        }

        const linesByOrder: Record<string, any[]> = lines.reduce<Record<string, any[]>>((acc, line) => {
            if (line.lineOccupiedWith) {
                if (!acc[line.lineOccupiedWith]) {
                    acc[line.lineOccupiedWith] = [];
                }
                acc[line.lineOccupiedWith].push(line);
            }
            return acc;
        }, {});

        for (const [orderNumber, lines] of Object.entries(linesByOrder)) {
            const order = await Order.findOne({ orderNumber });

            if (!order) {
                logger.warn(`No order found for order number: ${orderNumber}`);
                continue;
            }

            await handleOrderBreak(lines, order, logger);
        }

        for (const [orderNumber] of Object.entries(linesByOrder)) {
            const order = await Order.findOne({ orderNumber });

            if (!order) {
                logger.warn(`No order found for order number: ${orderNumber}`);
                continue;
            }

            if (!order.operators?.length) {
                logger.warn(`No operators found for order number: ${orderNumber}`);
                continue;
            }

            try {
                await order.updateOne({ operators: [] });
                logger.info(`Operators successfully removed for order: ${orderNumber}`);
            } catch (error) {
                logger.error(`Error removing operators for order ${orderNumber}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            }
        }

        logger.info("All occupied lines have been processed.");
    } catch (error) {
        logger.error(`Error in pauseOrdersJob: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
};
