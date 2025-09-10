crateas a new container from given image and starts it (does not re-use previous container)

```bash
docker run [-options] {name}[:{tag}]
```

>*You can find the container name in the list of all containers by executing the `docker images` command*
###### options

- `-d`, `--detach` : run container in background and print the container ID
- `-p`, `--publish` : publish a container's port to the host
  
```bash
docker run -d -p {HOST_PORT}:{CONTAINER:PORT} {name}[:{tag}]  
```

>***Only 1 service can run on a specific port on the host***

- `--name` : assing a name to the container

```bash
docker run --name test-app -d -p 9000:80 nginx:1.23
```

- `-e`, `-env` : set environment variables

```bash
docker run -e MYVAR1 -e MYVAR2=foo --env-file ./env.list ubuntu bash
```

![[Pasted image 20241022184848.png|400]]

