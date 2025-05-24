#!/usr/bin/env bash

#####################
# Release to Docker #
#####################
#
# Builds the image and pushes it to the Docker registry.
#
# Args:
#   tag name
#   "nolatest" if latest should not be updated as well.
#

set -e

if [[ -z "$1" ]]; then
    tag=latest
else
    tag=$1
fi

docker login codeberg.org
docker build -f docker/app/Dockerfile -t codeberg.org/socialhome/socialhome:${tag} .
docker push codeberg.org/socialhome/socialhome:${tag}

if [[ "$2" == "nolatest" ]]; then
    exit
fi

docker tag codeberg.org/socialhome/socialhome:${tag} codeberg.org/socialhome/socialhome:latest
docker push codeberg.org/socialhome/socialhome:latest
