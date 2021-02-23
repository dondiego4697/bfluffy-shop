* npx typeorm migration:create -n PostRefactoring
* npx ts-node ./node_modules/typeorm/cli.js migration:run
* npx ts-node ./node_modules/typeorm/cli.js migration:revert

* docker build -f Dockerfile.stress .
* docker run --env-file ./.env -p 8080:8080 -p 5432:5432 --memory="4g" --cpus="2" -it <hash>
* docker cp <hash>:/tmp/ammo.txt ~/Desktop/ammo.txt

```bash
docker run \
    -v $(pwd):/var/loadtest \
    -v $SSH_AUTH_SOCK:/ssh-agent -e SSH_AUTH_SOCK=/ssh-agent \
    --net host \
    -it \
    --entrypoint /bin/bash \
    direvius/yandex-tank
```

* yandex-tank -c server/tests/stress/tank.yml temp/ammo.txt