---
docs link: https://docs.docker.com/reference/cli/docker/compose/up/
---
builds, (re)creates, starts, and attaches to containers for a service

```bash
docker compose up [options] [service...]
```

```bash
docker-compose -f mongo-services.yaml up
```

>[!note]
>
>*Compose up aggregates the output of each container
>(like `docker compose logs --follow` does)*

