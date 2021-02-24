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

const CSV_HEADERS = ['path', 'method', 'payload'].join(';');

function makeRequest(path: string, method: 'get' | 'delete' | 'post', payload?: unknown) {
    return [`${API_PREFIX}${path}`, method.toUpperCase(), payload ? JSON.stringify(payload) : ''].join(';');
}

async function makeCatalogAmmo() {
    const requests: string[] = [CSV_HEADERS];
    const max = 2_000;
    const file = path.resolve('./temp/catalog-ammo.csv');

    await pMap(
        range(0, max),
        async (i) => {
            if (i % 6 === 0) {
                requests.push(makeRequest('/catalog/dictionary', 'get'));
            } else {
                const item = await TestFactory.getRandomCatalogItem();

                requests.push(makeRequest(`/catalog/item/${item.publicId}`, 'get'));
            }

            console.log(`catalog ammo ${i}/${max}`);
        },
        {concurrency: 10}
    );

    await fs.promises.appendFile(file, requests.join('\n'));
}

async function makeFullTextSearchAmmo() {
    const requests: string[] = [CSV_HEADERS];
    const max = 10_000;
    const file = path.resolve('./temp/full-text-search-ammo.csv');

    await pMap(
        range(0, max),
        async (i) => {
            const word = [
                ALPHABET[random(0, ALPHABET.length - 1)],
                ALPHABET[random(0, ALPHABET.length - 1)],
                ALPHABET[random(0, ALPHABET.length - 1)]
            ];

            requests.push(makeRequest(`/search/full_text?query=${word.join('')}`, 'get'));

            console.log(`full text search ammo ${i}/${max}`);
        },
        {concurrency: 10}
    );

    await fs.promises.writeFile(file, requests.join('\n'));
}

async function makeSearchAmmo() {
    const requests: string[] = [CSV_HEADERS];
    const max = 10_000;
    const file = path.resolve('./temp/search-ammo.csv');

    await pMap(
        range(0, max),
        async (i) => {
            const [pet, good, brand] = await TestFactory.getRandomDictionary();
            const min = random(100, 10000);

            requests.push(
                makeRequest('/search/base', 'post', {
                    limit: random(10, 30),
                    offset: random(0, 120),
                    petCode: pet.code,
                    brandCode: brand.code,
                    goodCode: good.code,
                    cost: {
                        min,
                        max: random(min, 100000)
                    }
                })
            );

            console.log(`search ammo ${i}/${max}`);
        },
        {concurrency: 10}
    );

    await fs.promises.writeFile(file, requests.join('\n'));
}

async function makeOrderAmmo() {
    const requests: string[] = [CSV_HEADERS];
    const max = 10_000;
    const file = path.resolve('./temp/order-ammo.csv');

    await pMap(
        range(0, max),
        async (i) => {
            if (i % 5 === 0) {
                const user = await TestFactory.getRandomUser();

                requests.push(
                    makeRequest('/sms/verify_code', 'post', {
                        phone: user.phone,
                        code: Math.random() > 0.5 ? random(1000, 9999) : user.lastSmsCode
                    }),
                    makeRequest('/sms/send_code', 'post', {
                        phone: Math.random() > 0.5 ? random(1000000, 9999999) : user.phone
                    })
                );
            } else if (i % 51 === 0) {
                const order = await TestFactory.getRandomOrder();

                requests.push(makeRequest(`/order/${order.publicId}`, 'delete'));
            } else if (i % 4 === 0) {
                const order = await TestFactory.getRandomOrder();

                requests.push(makeRequest(`/order/${order.publicId}`, 'get'));
            } else if (i % 3 === 0) {
                const catalogItem = await TestFactory.getRandomCatalogItem();

                requests.push(
                    makeRequest('/order/check_cart', 'post', {
                        goods: range(1, 4).map(() => ({
                            publicId: catalogItem.publicId,
                            cost: random(100, 10000),
                            quantity: random(1, 99)
                        }))
                    })
                );
            } else {
                const [user, storageItems] = await Promise.all([
                    TestFactory.getRandomUser(),
                    TestFactory.getRandomStorageItem(random(1, 4))
                ]);

                requests.push(
                    makeRequest('/order/create', 'post', {
                        phone: user.phone,
                        delivery: {
                            address: String(Math.random()),
                            date: moment().format('X'),
                            comment: String(Math.random())
                        },
                        goods: storageItems.map((item) => ({
                            publicId: item.catalogItem.publicId,
                            cost: item.cost,
                            quantity: 1
                        }))
                    })
                );
            }

            console.log(`order ammo ${i}/${max}`);
        },
        {concurrency: 10}
    );

    await fs.promises.writeFile(file, requests.join('\n'));
}

export async function handle() {
    await makeCatalogAmmo();
    await makeFullTextSearchAmmo();
    await makeSearchAmmo();
    await makeOrderAmmo();
}
