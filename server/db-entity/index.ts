import {Brand} from '$db/entity/brand';
import {Catalog} from '$db/entity/catalog';
import {GoodCategory} from '$db/entity/good-category';
import {OrderPosition} from '$db/entity/order-position';
import {Order} from '$db/entity/order';
import {PetCategory} from '$db/entity/pet-category';
import {Storage} from '$db/entity/storage';
import {User} from '$db/entity/user';

export {Brand, Catalog, GoodCategory, OrderPosition, Order, PetCategory, Storage, User};

export enum DbTable {
    USER = 'user',
    BRAND = 'brand',
    CATALOG = 'catalog',
    GOOD_CATEGORY = 'good_category',
    PET_CATEGORY = 'pet_category',
    STORAGE = 'storage',
    ORDER = 'order',
    ORDER_POSITION = 'order_position'
}
