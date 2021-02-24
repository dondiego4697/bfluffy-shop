
#!/usr/bin/env bash

export NODEJS_PORT=8080
export ENVIRONMENT=${ENVIRONMENT:-"development"}

envsubst \
    '\$NODEJS_PORT \$ENVIRONMENT' \
    < /config-templates/supervisord.template.conf \
    > /etc/supervisor/conf.d/supervisord.conf

/etc/init.d/elasticsearch start

sleep 30

/usr/bin/supervisord