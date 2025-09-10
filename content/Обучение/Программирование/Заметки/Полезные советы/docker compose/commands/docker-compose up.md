
```bash
docker-compose --project-name projects -f mongo-services.yaml up -d
```

re-start service after changing `docker-compose.yaml`

```bash
docker-compose up -d <имя_сервиса>
```

-  `<имя_сервиса>`, которое указано в `docker-compose.yaml`