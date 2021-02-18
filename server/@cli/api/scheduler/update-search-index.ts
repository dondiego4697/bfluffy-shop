export async function handle() {
    const {argv} = cliRuntime();
    const {name} = argv;

    if (!name) {
        throw new Error('"--name" is required');
    }
}
