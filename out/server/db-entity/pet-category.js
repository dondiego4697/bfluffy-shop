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
exports.PetCategory = void 0;
const typeorm_1 = require("typeorm");
const entities_1 = require("./entities");
const tables_1 = require("./tables");
let PetCategory = class PetCategory {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], PetCategory.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], PetCategory.prototype, "code", void 0);
__decorate([
    typeorm_1.Column({ name: 'display_name' }),
    __metadata("design:type", String)
], PetCategory.prototype, "displayName", void 0);
__decorate([
    typeorm_1.OneToMany(() => entities_1.Catalog, (catalog) => catalog.goodCategory),
    __metadata("design:type", Array)
], PetCategory.prototype, "catalog", void 0);
PetCategory = __decorate([
    typeorm_1.Entity({ name: tables_1.DbTable.PET_CATEGORY })
], PetCategory);
exports.PetCategory = PetCategory;
//# sourceMappingURL=pet-category.js.map