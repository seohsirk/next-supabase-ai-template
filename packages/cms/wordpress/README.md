# CMS/Wordpress - @kit/wordpress

Implementation of the CMS layer using the [Wordpress](https://wordpress.org) library. [WIP - not yet working]

This implementation is used when the host app's environment variable is set as:

```
CMS_TYPE=wordpress
```

Additionally, please set the following environment variables:

```
WORDPRESS_API_URL=http://localhost:8080
```

For development purposes, we ship a Docker container that runs a Wordpress instance. To start the container, run:

```
docker-compose up
```

or

```
npm run dev
```

from this package's root directory.