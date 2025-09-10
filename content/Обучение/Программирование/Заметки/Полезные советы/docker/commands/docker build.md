builds a docker image from a Dockerfile

```bash
docker build [options] {path}
```

##### options
- `--tag` or `-t` : sets a name and optionally a tag in the `name:tag` format 

```bash
docker build -t node-app:1.0 .
```

>[!note]
 `.` means build a docker image from Dockerfile into the current folder

Запуск Dockerfile из корня (решения)

```bash
docker build -t contactsapi:dev -f Contacts.API/Dockerfile .
```

Принудительно отключите использование кеша при сборке

```bash
docker build --no-cache -t <image_name> .
```