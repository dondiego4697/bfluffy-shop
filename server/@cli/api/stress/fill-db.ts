export async function handle() {
    const {ROOT_DIR} = cliRuntime();

    console.log(1, ROOT_DIR);
    // 1. users 10000 -> /sms
    // 2. catalog 100000
    // 3. catalog_items catalog.length * random(10, 20) -> /catalog
    // 4. storage catalog_items.length -> /order
    // 5. orders (+order_position) -> /order
    // 6. search
    // RESULT: make ammo console.log(путь до файла)
}
