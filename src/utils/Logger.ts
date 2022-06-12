import {createLogger, format, transports} from "winston";
import {StreamOptions} from "morgan";

const logger = createLogger({
    level: process.env.NODE_ENV === "production" ? "http" : "debug",
    exitOnError: false,
    format: format.combine(
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        format.colorize(),
        format.printf(log => {
            return `[${log.timestamp}] [${log.level}]: ${log.message}`;
        })
    ),
    transports: [new transports.Console()]
});

const morganLogStream: StreamOptions = {
    write: (message: string) => logger.http(message)
};

export default logger;
export {morganLogStream};
