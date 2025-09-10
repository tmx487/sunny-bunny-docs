Если сети не совпадают, можно подключить свой контейнер PostgreSQL к нужной сети:

```bash
docker network connect my_network <EXISTING_DB_CONTAINER_NAME>
```