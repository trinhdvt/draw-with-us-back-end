import {createLogger, format, transports} from "winston";

const logger = createLogger({
    level: "debug",
    format: format.combine(
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        format.colorize(),
        format.printf(log => {
            return `[${log.timestamp}] [${log.level}]: ${
                log.stack ? log.stack : JSON.stringify(log.message)
            }`;
        })
    ),
    transports: [new transports.Console()]
});

export default logger;
