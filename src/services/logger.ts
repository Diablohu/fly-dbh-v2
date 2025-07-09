import winston from "winston";
import "winston-daily-rotate-file";

import { folderNameLogs } from "@/server-vars";

const transports = ["error", "warn", "notice", "info", "http", undefined].map(
    (level) =>
        new winston.transports.DailyRotateFile({
            level,
            filename: `%DATE%.${level || "combined"}.log`,
            dirname: folderNameLogs,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxFiles: "14d",
            utc: true,
        })
);

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        // winston.format.label({ label: 'right meow!' }),
        winston.format.timestamp(),
        winston.format.prettyPrint(),
    ),
    // format: winston.format.json(),
    defaultMeta: { service: "fly-dbh-kook-bot" },
    transports,
});

export default logger;
