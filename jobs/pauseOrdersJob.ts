import { Order } from "../models/order";
import { Line } from "../models/line";
import { Break } from "../models/break";
import { POSITION_ENUM } from "../services/operatorsConfig";
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

        const { breaks } = order;

        const orderLineId = line._id;
        const matchingBreaks = breaks.filter((b) => b._line.toString() === orderLineId.toString());
        const lastMatchingBreak = matchingBreaks[matchingBreaks.length - 1];

        if (!lastMatchingBreak?.breakEnd) {
            return;
        }

        await Promise.all(
            matchingBreaks.map(async (lineBreak) => {
                const previousBreak = await Break.findOne({ _id: lineBreak._id });
                if (previousBreak) {
                    previousBreak.breakEnd = new Date();
                    await previousBreak.save();
                }
            })
        );

        const newBreak = new Break({
            breakStart: new Date(),
            _line: orderLineId,
        });
        await newBreak.save();

        const updatedBreaks = await Break.find({ _id: { $in: breaks.map((b) => b._id) } });

        updatedBreaks.push(newBreak);

        await order.updateOne({
            breaks: updatedBreaks,
            operators: POSITION_ENUM.map((position) => ({
                position,
                operator: null,
            })),
        });

        logger.info(`Break successfully added to order: ${lineOccupiedWith}`);
    } catch (error) {
        logger.error(`Error handling break for order ${lineOccupiedWith}: ${error.message}`);
    }
};

export const pauseOrdersJob = async (logger: Logger): Promise<void> => {
    try {
        const lines = await Line.find({ lineStatus: { $ne: "free" } });

        if (!lines.length) {
            logger.info("No occupied lines found to process.");
            return;
        }

        await Promise.all(lines.map((line) => {
            handleOrderBreak(line, logger);
        }));

        logger.info("All occupied lines have been processed.");
    } catch (error) {
        logger.error(`Error in pauseOrdersJob: ${error.message}`);
    }
};