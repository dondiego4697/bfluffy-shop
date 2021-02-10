"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = exports.OrderResolution = exports.OrderStatus = void 0;
const lodash_1 = require("lodash");
const typeorm_1 = require("typeorm");
const index_1 = require("./index");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["CREATED"] = "CREATED";
    OrderStatus["IN_DELIVERY"] = "IN_DELIVERY";
    OrderStatus["FINISHED"] = "FINISHED";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
var OrderResolution;
(function (OrderResolution) {
    OrderResolution["SUCCESS"] = "SUCCESS";
    OrderResolution["CANCELLED"] = "CANCELLED";
    OrderResolution["ANNULATED"] = "ANNULATED";
})(OrderResolution = exports.OrderResolution || (exports.OrderResolution = {}));
let Order = class Order {
    _convertNumerics() {
        this.id = lodash_1.toFinite(this.id);
    }
};
__decorate([
    typeorm_1.AfterLoad(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Order.prototype, "_convertNumerics", null);
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Order.prototype, "id", void 0);
__decorate([
    typeorm_1.OneToMany(() => index_1.OrderPosition, (position) => position.order),
    __metadata("design:type", Array)
], Order.prototype, "orderPositions", void 0);
__decorate([
    typeorm_1.Column({ name: 'public_id' }),
    __metadata("design:type", String)
], Order.prototype, "publicId", void 0);
__decorate([
    typeorm_1.Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Order.prototype, "data", void 0);
__decorate([
    typeorm_1.Column({ name: 'client_phone' }),
    __metadata("design:type", String)
], Order.prototype, "clientPhone", void 0);
__decorate([
    typeorm_1.Column({ name: 'delivery_address' }),
    __metadata("design:type", String)
], Order.prototype, "deliveryAddress", void 0);
__decorate([
    typeorm_1.Column({ nullable: true, name: 'delivery_comment' }),
    __metadata("design:type", String)
], Order.prototype, "deliveryComment", void 0);
__decorate([
    typeorm_1.Column({ name: 'delivery_date' }),
    __metadata("design:type", Date)
], Order.prototype, "deliveryDate", void 0);
__decorate([
    typeorm_1.Column({ name: 'created_at' }),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "resolution", void 0);
Order = __decorate([
    typeorm_1.Entity({ name: 'orders' })
], Order);
exports.Order = Order;
//# sourceMappingURL=order.js.map