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
exports.GoodCategory = void 0;
const typeorm_1 = require("typeorm");
const index_1 = require("./index");
let GoodCategory = class GoodCategory {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], GoodCategory.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], GoodCategory.prototype, "code", void 0);
__decorate([
    typeorm_1.Column({ name: 'display_name' }),
    __metadata("design:type", String)
], GoodCategory.prototype, "displayName", void 0);
__decorate([
    typeorm_1.OneToMany(() => index_1.Catalog, (catalog) => catalog.goodCategory),
    __metadata("design:type", Array)
], GoodCategory.prototype, "catalog", void 0);
GoodCategory = __decorate([
    typeorm_1.Entity()
], GoodCategory);
exports.GoodCategory = GoodCategory;
//# sourceMappingURL=good-category.js.map