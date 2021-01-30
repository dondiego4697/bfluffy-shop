npx typeorm migration:create -n PostRefactoring
npx ts-node ./node_modules/typeorm/cli.js migration:run
npx ts-node ./node_modules/typeorm/cli.js migration:revert