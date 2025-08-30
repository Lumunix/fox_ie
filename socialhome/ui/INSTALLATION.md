# Installation

No official release is available yet. These instructions are provided mainly for whoever
would like to give the new UI a spin, with the ability to fall back to the old UI if necessary
(I sincerely hope it won't be 😉 ).

What is described below is based on my own setup using a docker/podman container behind a nginx reverse
proxy. YMMV.

## Getting the socialhome container

The images are stored in the codeberg.org repository and include the old UI, as well as the
Django backend. First, follow the instructions at 

`https://socialhome.readthedocs.io/en/latest/installation/docker.html#installation-docker,`

replacing the container location with

codeberg.org/socialhome/socialhome:0.22.0

_Note: both amd64 and arm64 images are available._

## Getting the SPA UI production build

Next, download the SPA UI production build with

`curl -OJ https://codeberg.org/api/packages/socialhome/generic/socialhome-ui/0.7.2/socialhome-ui.tgz`

Then we need to make sure the UI assets are statically served. Here's an example of what
could be added to an existing nginx configuration:

```
server {
...
    location /assets {
        root <directory where the socialhome-ui.tgz file was untarred>/dist
    }
...
```

There are of course many possible variations to this configuration, depending on your setup.

Finally, docker/podman must be invoked as per the socialhome documentation, adding the following bind mount option:

`-v <directory where the socialhome-ui.tgz file was untarred>/dist/index.html:/app/socialhome/templates/index.html`

## Switching to the SPA UI

Only registered users can try the new UI. Once a logged in socialhome, select __Account__ from the cog icon menu, then
select the __Use new UI__ checkbox and click __Save__. You should be redirected to the SPA UI.

## Reporting issues

Please report any issue you may encounter to https://codeberg.org/socialhome/socialhome-ui/issues.
