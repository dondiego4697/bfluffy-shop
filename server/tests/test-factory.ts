import faker from 'faker';
import slugify from 'slugify';

import {dbManager} from 'app/lib/db-manager';
import {Brand, GoodCategory, PetCategory} from 'db-entity/index';

async function createBrand() {
    const name = faker.name.title();

    const {
        raw: [brandRaw]
    } = await dbManager
        .getConnection()
        .createQueryBuilder()
        .insert()
        .into(Brand)
        .values([
            {
                code: slugify(name),
                displayName: name
            }
        ])
        .returning('*')
        .execute();

    return {
        id: brandRaw.id,
        code: brandRaw.code,
        displayName: brandRaw.display_name
    };
}

async function createPetCategory() {
    const name = faker.name.title();

    const {
        raw: [petRaw]
    } = await dbManager
        .getConnection()
        .createQueryBuilder()
        .insert()
        .into(PetCategory)
        .values([
            {
                code: slugify(name),
                displayName: name
            }
        ])
        .returning('*')
        .execute();

    return {
        id: petRaw.id,
        code: petRaw.code,
        displayName: petRaw.display_name
    };
}

async function createGoodCategory() {
    const name = faker.name.title();

    const {
        raw: [goodRaw]
    } = await dbManager
        .getConnection()
        .createQueryBuilder()
        .insert()
        .into(GoodCategory)
        .values([
            {
                code: slugify(name),
                displayName: name
            }
        ])
        .returning('*')
        .execute();

    return {
        id: goodRaw.id,
        code: goodRaw.code,
        displayName: goodRaw.display_name
    };
}

export const TestFactory = {
    createBrand,
    createPetCategory,
    createGoodCategory
};
