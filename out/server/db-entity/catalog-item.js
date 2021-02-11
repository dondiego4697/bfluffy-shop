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
exports.CatalogItem = void 0;
const lodash_1 = require("lodash");
const typeorm_1 = require("typeorm");
const entities_1 = require("./entities");
const tables_1 = require("./tables");
let CatalogItem = class CatalogItem {
    _convertNumerics() {
        this.id = lodash_1.toFinite(this.id);
        this.catalogId = lodash_1.toFinite(this.catalogId);
    }
};
__decorate([
    typeorm_1.AfterLoad(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogItem.prototype, "_convertNumerics", null);
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], CatalogItem.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ name: 'public_id' }),
    __metadata("design:type", String)
], CatalogItem.prototype, "publicId", void 0);
__decorate([
    typeorm_1.Column({ name: 'catalog_id' }),
    __metadata("design:type", Number)
], CatalogItem.prototype, "catalogId", void 0);
__decorate([
    typeorm_1.ManyToOne(() => entities_1.Catalog, (catalog) => catalog.catalogItems),
    typeorm_1.JoinColumn({ name: 'catalog_id', referencedColumnName: 'id' }),
    __metadata("design:type", entities_1.Catalog)
], CatalogItem.prototype, "catalog", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], CatalogItem.prototype, "weight", void 0);
__decorate([
    typeorm_1.Column({ type: 'jsonb', name: 'photo_urls' }),
    __metadata("design:type", Array)
], CatalogItem.prototype, "photoUrls", void 0);
__decorate([
    typeorm_1.Column({ name: 'created_at' }),
    __metadata("design:type", Date)
], CatalogItem.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.Column({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CatalogItem.prototype, "updatedAt", void 0);
CatalogItem = __decorate([
    typeorm_1.Entity({ name: tables_1.DbTable.CATALOG_ITEM })
], CatalogItem);
exports.CatalogItem = CatalogItem;
//# sourceMappingURL=catalog-item.js.map