import dotenv from 'dotenv';

dotenv.config();

process.env.ENVIRONMENT = 'stress';

import fs from 'fs';
import path from 'path';
import moment from 'moment';
import pMap from 'p-map';
import {random, range} from 'lodash';
import {TestFactory} from 'tests/test-factory';

const API_PREFIX = '/api/v1';
const ALPHABET = [
    'а',
    'б',
    'в',
    'г',
    'д',
    'е',
    'ё',
    'ж',
    'з',
    'и',
    'й',
    'к',
    'л',
    'м',
    'н',
    'о',
    'п',
    'р',
    'с',
    'т',
    'у',
    'ф',
    'х',
    'ц',
    'ч',
    'ш',
    'щ',
    'э',
    'ю',
    'я'
];

function makeRequest(path: string, method: 'get' | 'delete') {
    return Buffer.from(JSON.stringify({
        method,
        path: `${API_PREFIX}${path}`
    }) + '\n', 'utf8');
}

function makePostRequest(path: string, body: unknown) {
    return Buffer.from(JSON.stringify({
        method: 'post',
        path: `${API_PREFIX}${path}`,
        body
    }) + '\n', 'utf8');
}

async function makeCatalogAmmo() {
    const buffer: Buffer[] = [];
    const max = 2_000;

    await pMap(
        range(0, max),
        async (i) => {
            if (i % 6 === 0) {
                buffer.push(makeRequest('/catalog/dictionary', 'get'));
            } else {
                const item = await TestFactory.getRandomCatalogItem();

                buffer.push(makeRequest(`/catalog/item/${item.publicId}`, 'get'));
            }

            console.log(`catalog ammo ${i}/${max}`);
        },
        {concurrency: 10}
    );

    await fs.promises.writeFile(path.resolve('./temp/catalog-ammo.txt'), Buffer.concat(buffer));
}

async function makeSearchAmmo() {
    let buffer: Buffer[] = [];
    const max = 10_000;

    await pMap(
        range(0, max),
        async (i) => {
            const word = [
                ALPHABET[random(0, ALPHABET.length - 1)],
                ALPHABET[random(0, ALPHABET.length - 1)],
                ALPHABET[random(0, ALPHABET.length - 1)]
            ];

            buffer.push(makeRequest(`/search/full_text?query=${word.join('')}`, 'get'));

            console.log(`full text search ammo ${i}/${max}`);
        },
        {concurrency: 10}
    );

    await fs.promises.writeFile(path.resolve('./temp/full-text-search-ammo.txt'), Buffer.concat(buffer));

    buffer = [];

    await pMap(
        range(0, max),
        async (i) => {
            const [pet, good, brand] = await TestFactory.getRandomDictionary();
            const min = random(100, 10000);

            buffer.push(
                makePostRequest(
                    '/search/base',
                    {
                        limit: random(10, 30),
                        offset: random(0, 120),
                        petCode: pet.code,
                        brandCode: brand.code,
                        goodCode: good.code,
                        cost: {
                            min,
                            max: random(min, 100000)
                        }
                    }
                )
            );

            console.log(`search ammo ${i}/${max}`);
        },
        {concurrency: 10}
    );

    await fs.promises.writeFile(path.resolve('./temp/search-ammo.txt'), Buffer.concat(buffer));
}

async function makeOrderAmmo() {
    const buffer: Buffer[] = [];
    const max = 10_000;

    await pMap(
        range(0, max),
        async (i) => {
            if (i % 5 === 0) {
                const user = await TestFactory.getRandomUser();

                buffer.push(
                    makePostRequest(
                        '/sms/verify_code',
                        {
                            phone: user.phone,
                            code: Math.random() > 0.5 ? random(1000, 9999) : user.lastSmsCode
                        }
                    ),
                    makePostRequest(
                        '/sms/send_code',
                        {
                            phone: Math.random() > 0.5 ? random(1000000, 9999999) : user.phone
                        }
                    )
                );
            } else if (i % 51 === 0) {
                const order = await TestFactory.getRandomOrder();

                buffer.push(makeRequest(`/order/${order.publicId}`, 'delete'));
            } else if (i % 4 === 0) {
                const order = await TestFactory.getRandomOrder();

                buffer.push(makeRequest(`/order/${order.publicId}`, 'get'));
            } else if (i % 3 === 0) {
                const catalogItem = await TestFactory.getRandomCatalogItem();

                buffer.push(
                    makePostRequest(
                        '/order/check_cart',
                        {
                            goods: range(1, 4).map(() => ({
                                publicId: catalogItem.publicId,
                                cost: random(100, 10000),
                                quantity: random(1, 99)
                            }))
                        }
                    )
                );
            } else {
                const [user, storageItems] = await Promise.all([
                    TestFactory.getRandomUser(),
                    TestFactory.getRandomStorageItem(random(1, 4))
                ]);

                buffer.push(
                    makePostRequest(
                        '/order/create',
                        {
                            phone: user.phone,
                            delivery: {
                                address: Math.random(),
                                date: moment().format('X'),
                                comment: Math.random()
                            },
                            goods: storageItems.map((item) => ({
                                publicId: item.catalogItem.publicId,
                                cost: item.cost,
                                quantity: 1
                            }))
                        }
                    )
                );
            }

            console.log(`order ammo ${i}/${max}`);
        },
        {concurrency: 10}
    );

    await fs.promises.writeFile(path.resolve('./temp/order-ammo.txt'), Buffer.concat(buffer));
}

export async function handle() {
    await makeCatalogAmmo();
    await makeSearchAmmo();
    await makeOrderAmmo();
}
