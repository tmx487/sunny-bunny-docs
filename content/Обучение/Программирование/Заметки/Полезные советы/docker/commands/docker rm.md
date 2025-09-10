```bash
docker rm <container_name_or_id>
```

```bash
docker rm <container_id_1> <container_id_2> ...
```

**Принудительное удаление работающего контейнера:** Если контейнер все еще работает, добавьте флаг `-f`:
```
docker rm -f <container_name_or_id>
```

Удалить все остановленные контейнеры:
```bash
docker container prune
```

💡 Если нужно удалить также образы или сети, используйте:

- **Удаление образов:** `docker rmi <image_name_or_id>`
- **Удаление сетей:** `docker network rm <network_name>`