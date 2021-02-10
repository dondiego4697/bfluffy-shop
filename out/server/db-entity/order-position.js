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
exports.OrderPosition = void 0;
const lodash_1 = require("lodash");
const typeorm_1 = require("typeorm");
const index_1 = require("./index");
let OrderPosition = class OrderPosition {
    _convertNumerics() {
        this.id = lodash_1.toFinite(this.id);
        this.orderId = lodash_1.toFinite(this.orderId);
        this.cost = lodash_1.toFinite(this.cost);
    }
};
__decorate([
    typeorm_1.AfterLoad(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrderPosition.prototype, "_convertNumerics", null);
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], OrderPosition.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(() => index_1.Order, (order) => order.orderPositions),
    typeorm_1.JoinColumn({ name: 'order_id', referencedColumnName: 'id' }),
    __metadata("design:type", index_1.Order)
], OrderPosition.prototype, "order", void 0);
__decorate([
    typeorm_1.Column({ name: 'order_id' }),
    __metadata("design:type", Number)
], OrderPosition.prototype, "orderId", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], OrderPosition.prototype, "cost", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], OrderPosition.prototype, "quantity", void 0);
__decorate([
    typeorm_1.Column({ type: 'jsonb' }),
    __metadata("design:type", Object)
], OrderPosition.prototype, "data", void 0);
__decorate([
    typeorm_1.Column({ name: 'created_at' }),
    __metadata("design:type", Date)
], OrderPosition.prototype, "createdAt", void 0);
OrderPosition = __decorate([
    typeorm_1.Entity()
], OrderPosition);
exports.OrderPosition = OrderPosition;
//# sourceMappingURL=order-position.js.map