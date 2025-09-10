---
docs link: https://docs.docker.com/reference/cli/docker/compose/down/
---

stops containers and removes containers, networks, volumes, and images created by `up`

```bash
docker compose down [OPTIONS] [SERVICES]
```

Удалить промежуточные образы и кэш (включая и сети)

```bash
docker-compose down --rmi all --volumes --remove-orphans
```