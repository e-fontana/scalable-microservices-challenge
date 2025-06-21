#!/bin/bash
set -e

echo "Kong custom entrypoint: Processing configuration template..."

if [ -f "/kong/config.template.yaml" ]; then
    echo "Found configuration template at /kong/config.template.yaml"

    envsubst < /kong/config.template.yaml > /kong/config.yaml

    export KONG_DECLARATIVE_CONFIG=/kong/config.yaml
else
    echo "No configuration template found at /kong/config.template.yaml"
    echo "Using default configuration"
fi

. /docker-entrypoint.sh