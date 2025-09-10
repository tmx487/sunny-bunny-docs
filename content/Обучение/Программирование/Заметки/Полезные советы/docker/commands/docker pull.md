download an image from a registry (usually from docker hub) and install it

```bash
docker pull {name}[:{tag}]
```

##### example of usage

```bash
docker pull postgres:alpine3.20
```

>*When no tag is provided in the `docker pull` command, the `latest` tag is used by default*