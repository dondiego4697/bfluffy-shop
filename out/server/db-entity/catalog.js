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
exports.Catalog = void 0;
const lodash_1 = require("lodash");
const typeorm_1 = require("typeorm");
const entities_1 = require("./entities");
const tables_1 = require("./tables");
let Catalog = class Catalog {
    _convertNumerics() {
        this.id = lodash_1.toFinite(this.id);
        this.goodCategoryId = lodash_1.toFinite(this.goodCategoryId);
        this.petCategoryId = lodash_1.toFinite(this.petCategoryId);
        this.brandId = lodash_1.toFinite(this.brandId);
    }
};
__decorate([
    typeorm_1.AfterLoad(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Catalog.prototype, "_convertNumerics", null);
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Catalog.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ name: 'good_category_id' }),
    __metadata("design:type", Number)
], Catalog.prototype, "goodCategoryId", void 0);
__decorate([
    typeorm_1.ManyToOne(() => entities_1.GoodCategory, (goodCategory) => goodCategory.catalog),
    typeorm_1.JoinColumn({ name: 'good_category_id', referencedColumnName: 'id' }),
    __metadata("design:type", entities_1.GoodCategory)
], Catalog.prototype, "goodCategory", void 0);
__decorate([
    typeorm_1.Column({ name: 'pet_category_id' }),
    __metadata("design:type", Number)
], Catalog.prototype, "petCategoryId", void 0);
__decorate([
    typeorm_1.ManyToOne(() => entities_1.PetCategory, (petCategory) => petCategory.catalog),
    typeorm_1.JoinColumn({ name: 'pet_category_id', referencedColumnName: 'id' }),
    __metadata("design:type", entities_1.PetCategory)
], Catalog.prototype, "petCategory", void 0);
__decorate([
    typeorm_1.Column({ name: 'brand_id' }),
    __metadata("design:type", Number)
], Catalog.prototype, "brandId", void 0);
__decorate([
    typeorm_1.ManyToOne(() => entities_1.Brand, (brand) => brand.catalog),
    typeorm_1.JoinColumn({ name: 'brand_id', referencedColumnName: 'id' }),
    __metadata("design:type", entities_1.Brand)
], Catalog.prototype, "brand", void 0);
__decorate([
    typeorm_1.OneToMany(() => entities_1.CatalogItem, (catalogItem) => catalogItem.catalog),
    __metadata("design:type", Array)
], Catalog.prototype, "catalogItems", void 0);
__decorate([
    typeorm_1.Column({ name: 'display_name' }),
    __metadata("design:type", String)
], Catalog.prototype, "displayName", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Catalog.prototype, "description", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Catalog.prototype, "rating", void 0);
__decorate([
    typeorm_1.Column({ nullable: true, name: 'manufacturer_country' }),
    __metadata("design:type", String)
], Catalog.prototype, "manufacturerCountry", void 0);
__decorate([
    typeorm_1.Column({ name: 'created_at' }),
    __metadata("design:type", Date)
], Catalog.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.Column({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Catalog.prototype, "updatedAt", void 0);
Catalog = __decorate([
    typeorm_1.Entity({ name: tables_1.DbTable.CATALOG })
], Catalog);
exports.Catalog = Catalog;
//# sourceMappingURL=catalog.js.map