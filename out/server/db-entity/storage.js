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
exports.Storage = void 0;
const lodash_1 = require("lodash");
const typeorm_1 = require("typeorm");
const index_1 = require("./index");
let Storage = class Storage {
    _convertNumerics() {
        this.id = lodash_1.toFinite(this.id);
        this.cost = lodash_1.toFinite(this.cost);
        this.catalogId = lodash_1.toFinite(this.catalogId);
    }
};
__decorate([
    typeorm_1.AfterLoad(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Storage.prototype, "_convertNumerics", null);
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Storage.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ name: 'catalog_id' }),
    __metadata("design:type", Number)
], Storage.prototype, "catalogId", void 0);
__decorate([
    typeorm_1.OneToOne(() => index_1.Catalog),
    typeorm_1.JoinColumn({ name: 'catalog_id', referencedColumnName: 'id' }),
    __metadata("design:type", index_1.Catalog)
], Storage.prototype, "catalog", void 0);
__decorate([
    typeorm_1.Column({ type: 'numeric' }),
    __metadata("design:type", Number)
], Storage.prototype, "cost", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Storage.prototype, "quantity", void 0);
__decorate([
    typeorm_1.Column({ name: 'created_at' }),
    __metadata("design:type", Date)
], Storage.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.Column({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Storage.prototype, "updatedAt", void 0);
Storage = __decorate([
    typeorm_1.Entity()
], Storage);
exports.Storage = Storage;
//# sourceMappingURL=storage.js.map