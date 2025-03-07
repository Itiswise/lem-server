import { Order } from "../models/order";
import { XlsxSource } from "../models/xlsxSource";
import { Line } from "../models/line";
import { Break } from "../models/break";
import { Logger } from "winston";
import mongoose from "mongoose";

const handleOrderBreak = async (
    order: any,
    lines: any[],
    logger: Logger
): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedBreaks = [...order.breaks];

        for (const line of lines) {
            const lineId = line._id.toString();

            const openBreaks = order.breaks.filter(
                (b: any) => b._line?.toString() === lineId && !b.breakEnd
            );

            for (const breakItem of openBreaks) {
                const breakModel = await Break.findById(breakItem._id).session(session);
                if (breakModel && !breakModel.breakEnd) {
                    breakModel.breakEnd = new Date();
                    await breakModel.save({ session });

                    const index = updatedBreaks.findIndex(
                        (b: any) => b._id.toString() === breakItem._id.toString()
                    );
                    if (index !== -1) {
                        updatedBreaks[index].breakEnd = breakModel.breakEnd;
                    }
                }
            }

            const newBreak = await new Break({
                breakStart: new Date(),
                _line: lineId,
            }).save({ session });

            updatedBreaks.push({
                _id: newBreak._id,
                breakStart: newBreak.breakStart,
                _line: newBreak._line,
            });

            logger.info(
                `Added new break for line ${lineId} in order ${order.orderNumber}.`
            );
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: order._id },
            { $set: { operators: [], breaks: updatedBreaks } },
            { new: true, runValidators: true, session }
        );

        if (!updatedOrder) {
            await session.abortTransaction();
            logger.error(`Failed to update order ${order.orderNumber}`);

            return Promise.reject(new Error(`Failed to update order ${order.orderNumber}`));
        }

        await session.commitTransaction();
        logger.info(`Order ${order.orderNumber} was successfully paused.`);
    } catch (error) {
        await session.abortTransaction();
        logger.error(`Error - ${order.orderNumber}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);

        return Promise.reject(error);
    } finally {
        await session.endSession();
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
        if (!xlsxSource?.menuContent?.length) {
            logger.info("No menu content found.");
            return;
        }

        const orderNumbers = xlsxSource.menuContent
            .map((item) => item.orderNumber)
            .filter((orderNumber): orderNumber is string => Boolean(orderNumber));

        if (!orderNumbers.length) {
            logger.info("No order numbers found in menu content.");
            return;
        }

        const orders = await Order.find({
            orderNumber: { $in: orderNumbers },
            orderStatus: { $ne: "closed" },
        });

        if (!orders.length) {
            logger.warn("No valid orders found to pause.");
            return;
        }

        for (const order of orders) {
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