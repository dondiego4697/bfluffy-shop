import {Request, Response} from 'express';
import {config} from 'app/config';

export function cors(req: Request, res: Response) {
    const origin = req.headers.origin || '';
    const allowedOrigins = config['cors.allowedOrigins'];

    if (Array.isArray(origin) || (allowedOrigins && !allowedOrigins.includes(origin))) {
        throw new Error('unsupported origin in this request');
    }

    res.set({
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'access-control-allow-headers': config['header.requestId'],
        'access-control-allow-credentials': 'true'
    });

    if (!req.path.includes('/api')) {
        res.setHeader('access-control-max-age', 86400);
    }

    res.send();
}
