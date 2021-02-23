#!/usr/bin/env bash

export NODEJS_PORT=8080
export ENVIRONMENT=stress

envsubst \
    '\$NODEJS_PORT \$ENVIRONMENT' \
    < /config-templates/supervisord.template.conf \
    > /etc/supervisor/conf.d/supervisord.conf

echo "local   replication     all                                     trust" >> /etc/postgresql/12/main/pg_hba.conf
echo "host    all             all             0.0.0.0/0               md5" >> /etc/postgresql/12/main/pg_hba.conf
echo "listen_addresses = '*'" >> /etc/postgresql/12/main/postgresql.conf

/etc/init.d/postgresql start

sudo -u postgres psql -c '\x' -c "ALTER USER postgres WITH PASSWORD 'password';"
sudo -u postgres psql -c '\x' -c "UPDATE pg_database SET datistemplate=FALSE WHERE datname='template1'"
sudo -u postgres psql -c '\x' -c "DROP DATABASE template1"
sudo -u postgres psql -c '\x' -c "CREATE DATABASE template1 WITH owner=postgres template=template0 encoding='UTF8' lc_collate='ru_RU.UTF-8' lc_ctype='ru_RU.UTF-8'"
sudo -u postgres psql -c '\x' -c "UPDATE pg_database SET datistemplate=TRUE WHERE datname='template1'"
sudo -u postgres psql -c '\x' -c "CREATE DATABASE petstore WITH ENCODING 'UTF8' OWNER postgres"

cd /usr/local/app
npx ts-node ./node_modules/typeorm/cli.js migration:run -c stress

/etc/init.d/elasticsearch start

sleep 30

/usr/bin/supervisord