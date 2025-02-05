import { Order } from "../models/order";
import { XlsxSource } from "../models/xlsxSource";
import { Line } from "../models/line";
import { Break } from "../models/break";
import { Logger } from "winston";

const handleOrderBreak = async (order: any, lines: any[], logger: Logger): Promise<void> => {
    try {
        const updatedBreaks = [...order.breaks];

        for (const line of lines) {
            const lineId = line._id;

            const openBreaks = order.breaks.filter(
                (b: any) =>
                    b._line &&
                    b._line.toString() === lineId.toString() &&
                    !b.breakEnd
            );

            for (const breakItem of openBreaks) {
                const breakModel = await Break.findById(breakItem._id);
                if (breakModel && !breakModel.breakEnd) {
                    breakModel.breakEnd = new Date();
                    await breakModel.save();

                    const index = updatedBreaks.findIndex((b: any) => b._id.toString() === breakItem._id.toString());
                    if (index !== -1) {
                        updatedBreaks[index].breakEnd = breakModel.breakEnd;
                    }
                }
            }

            const newBreak = new Break({
                breakStart: new Date(),
                _line: lineId,
            });
            await newBreak.save();

            updatedBreaks.push({
                _id: newBreak._id,
                breakStart: newBreak.breakStart,
                _line: newBreak._line,
            });

            logger.info(`Added new break for line ${lineId} in order ${order.orderNumber}.`);
        }

        order.operators = [];
        order.breaks = updatedBreaks;

        await order.save();

        logger.info(`Order ${order.orderNumber} was successfully paused.`);
    } catch (error) {
        logger.error(
            `Error - ${order.orderNumber}: ${
                error instanceof Error ? error.message : JSON.stringify(error)
            }`
        );
    }
};

export const pauseOrdersJob = async (logger: Logger): Promise<void> => {
    try {
        const lines = await Line.find({});
        if (!lines.length) {
            logger.info("No lines found to pause orders.");
            return;
        }

        const xlsxSource = await XlsxSource.findOne({ idCode: "menu" });
        if (!xlsxSource || !xlsxSource.menuContent || !xlsxSource.menuContent.length) {
            logger.info("No menu content found.");
            return;
        }

        const orderNumbers = xlsxSource.menuContent
            .map(item => item.orderNumber)
            .filter((orderNumber): orderNumber is string => Boolean(orderNumber));

        if (!orderNumbers.length) {
            logger.info("No order numbers found in menu content.");
            return;
        }

        for (const orderNumber of orderNumbers) {
            const order = await Order.findOne({
                orderNumber,
                orderStatus: { $ne: 'closed' }
            });

            if (!order) {
                logger.warn(`Order ${orderNumber} not found or already closed.`);
                continue;
            }

            await handleOrderBreak(order, lines, logger);
        }

        logger.info("All orders were successfully paused.");
    } catch (error) {
        logger.error(
            `Error: ${
                error instanceof Error ? error.message : JSON.stringify(error)
            }`
        );
    }
};
