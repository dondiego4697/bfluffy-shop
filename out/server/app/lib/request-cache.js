"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const slugify_1 = __importDefault(require("slugify"));
const object_hash_1 = __importDefault(require("object-hash"));
const config_1 = require("../config");
const DEFAULT_TTL = 60 * 5; // 5 min
class RequestCache {
    constructor() {
        this.cache = new node_cache_1.default({ stdTTL: DEFAULT_TTL });
    }
    makeKey(req) {
        return [slugify_1.default(req.path), object_hash_1.default(req.query), object_hash_1.default(req.body)].join('_');
    }
    get(req) {
        const key = this.makeKey(req);
        return this.cache.get(key);
    }
    set(req, data, ttl = DEFAULT_TTL) {
        if (!config_1.config['app.cache.enable']) {
            return;
        }
        const key = this.makeKey(req);
        this.cache.set(key, data, ttl);
    }
}
exports.requestCache = new RequestCache();
//# sourceMappingURL=request-cache.js.map