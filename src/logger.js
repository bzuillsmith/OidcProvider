var winston = require('winston');

const format = winston.format;
const { combine, timestamp, colorize, printf } = format;



var errorFormatter = format((info) => {
    if (typeof(info.message) === 'string' && typeof(info.stack) === 'string') {
        var stack = info.stack;
        if(stack.startsWith('Error:')) stack = stack.slice(7);
        info.message = stack;
    }

    return info;
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        colorize(),
        timestamp(),
        errorFormatter(),
        printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
        })),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;