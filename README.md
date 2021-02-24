* npx typeorm migration:create -n PostRefactoring
* npx ts-node ./node_modules/typeorm/cli.js migration:run
* npx ts-node ./node_modules/typeorm/cli.js migration:revert

* docker build -f Dockerfile.stress .
* docker run --env-file ./.env -p 8080:8080 -p 5432:5432 --memory="4g" --cpus="2" -it <hash>

* docker tag <hash> cr.yandex/crppqted76qfcesmjqtd/main-server:<version>
* docker push cr.yandex/crppqted76qfcesmjqtd/main-server:<version>