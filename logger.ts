import winston from "winston";

export const createLogger = () => {
    const logger = winston.createLogger({
        level: "info",
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({level, message}) => {
                return `${level.toUpperCase()}: ${message}`;
            })
        ),
        transports: [
            new winston.transports.File({ filename: "logs/app.log", level: "info" }),
            new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        ],
    });

    if (process.env.NODE_ENV !== "production") {
        logger.add(new winston.transports.Console({ format: winston.format.simple() }));
    }

    return logger;
};
