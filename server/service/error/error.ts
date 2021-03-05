import {Request} from 'express';
import {logger} from '$logger/logger';

interface Params {
    message?: string;
    group?: 'application' | 'database' | 'sms_provider';
    request?: Request;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta?: Record<string, any>;
}

type ClientErrorCode =
    | 'COST_OR_QUANTITY_CHANGED'
    | 'ORDER_ALREADY_FINISHED'
    | 'ORDER_ALREADY_CONFIRMED'
    | 'ORDER_NOT_IN_CREATED_STATUS'
    | 'SMS_SEND_FAILED'
    | 'USER_DOES_NOT_EXIST';

export class LoggableError extends Error {
    constructor(params: Params) {
        const {message = '', group = 'unknown', meta = {}, request} = params;

        super(message);

        const log = {
            ...meta,
            group
        };

        if (request) {
            request.logger.error(message, log);
        } else {
            logger.error(message, log);
        }
    }
}

export class ClientError extends LoggableError {
    public clientErrorCode: ClientErrorCode;

    constructor(clientErrorCode: ClientErrorCode, params: Params) {
        super(params);

        this.clientErrorCode = clientErrorCode;
    }
}
