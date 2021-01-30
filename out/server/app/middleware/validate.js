"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryValidat = exports.bodyValidate = void 0;
const Boom = __importStar(require("@hapi/boom"));
function bodyValidate(schema, options = {}) {
    return (req, _, next) => {
        const body = validateJoiSchema(schema, req.body, options);
        req.body = body;
        next();
    };
}
exports.bodyValidate = bodyValidate;
function queryValidat(schema, options = {}) {
    return (req, _res, next) => {
        const query = validateJoiSchema(schema, req.query, options);
        req.query = query;
        next();
    };
}
exports.queryValidat = queryValidat;
function validateJoiSchema(schema, data, options = {}) {
    const { error, value } = schema.validate(data, options);
    if (error) {
        throw Boom.badRequest(error.details.map(({ message }) => message).join(', '));
    }
    return value;
}
//# sourceMappingURL=validate.js.map