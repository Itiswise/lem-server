import winston, { format, transports, Logger } from "winston";

export const createLogger = (): Logger => {
    const logger = winston.createLogger({
        level: "info",
        format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            format.printf((info: winston.Logform.TransformableInfo & { timestamp?: string }) => {
                const { level, message, timestamp } = info;
                return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
            })
        ),
        transports: [
            new transports.File({ filename: "logs/app.log", level: "info" }),
            new transports.File({ filename: "logs/error.log", level: "error" }),
        ],
    });

    if (process.env.NODE_ENV !== "production") {
        logger.add(
            new transports.Console({
                format: format.combine(
                    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                    format.printf((info: winston.Logform.TransformableInfo & { timestamp?: string }) => {
                        const { level, message, timestamp } = info;
                        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
                    })
                ),
            })
        );
    }

    return logger;
};
