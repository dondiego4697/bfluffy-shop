import {createLogger, format, transports} from 'winston';
import {config} from 'app/config';

const {printf} = format;

const loggerFormat = printf((rawData) => {
    const {message, level, timestamp, ...other} = rawData;
    const data = {level, timestamp, ...other};

    if (typeof message === 'object') {
        Object.assign(data, message);
    } else {
        Object.assign(data, {message});
    }

    return Object.entries(data)
        .map(([k, v]) => {
            if (typeof v === 'object') {
                return `${k}=${JSON.stringify(v)}`;
            }

            // TODO filter headers

            return `${k}=${v}`;
        })
        .join('\t');
});

export const logger = createLogger({
    silent: process.env.DISABLE_LOGGING === '1',
    level: config['logger.level'],
    format: format.combine(
        config['logger.colorize'] ? format.colorize() : format.uncolorize(),
        format.timestamp(),
        loggerFormat
    ),
    transports: [new transports.Console()]
});
