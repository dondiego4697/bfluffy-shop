/* eslint-disable @typescript-eslint/no-namespace */

import {Logger} from 'winston';

declare global {
    namespace Express {
        interface Request {
            nonce: string;
            requestId: string;
            logger: Logger;
        }
    }
}
