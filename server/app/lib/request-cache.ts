/* eslint-disable @typescript-eslint/no-explicit-any */
import {Request} from 'express';
import NodeCache from 'node-cache';
import slugify from 'slugify';
import objectHash from 'object-hash';
import {config} from 'app/config';

const DEFAULT_TTL = 60 * 5; // 5 min

class RequestCache {
    protected cache = new NodeCache({stdTTL: DEFAULT_TTL});

    protected makeKey(req: Request) {
        return [slugify(req.path), objectHash(req.query), objectHash(req.body)].join('_');
    }

    public get(req: Request): any | undefined {
        const key = this.makeKey(req);

        return this.cache.get<any>(key);
    }

    public set(req: Request, data: any, ttl = DEFAULT_TTL) {
        if (!config['app.cache.enable']) {
            return;
        }

        const key = this.makeKey(req);

        this.cache.set(key, data, ttl);
    }
}

export const requestCache = new RequestCache();
