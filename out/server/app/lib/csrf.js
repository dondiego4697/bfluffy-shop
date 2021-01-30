"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSRF = void 0;
const csrf_1 = __importDefault(require("csrf"));
const csrf = new csrf_1.default();
const secret = csrf.secretSync();
exports.CSRF = {
    generateToken() {
        return csrf.create(secret);
    },
    isTokenValid(req) {
        const token = req.query.csrf || (req.body && req.body.csrf);
        if (!token) {
            return false;
        }
        return csrf.verify(secret, token);
    }
};
//# sourceMappingURL=csrf.js.map