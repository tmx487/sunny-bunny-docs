### Why

- for app with microservices

>[!Docker Compose]
>
>is a tool which allows you to define and run multiple services in 1 isolated environment

### Netword configuration

- by default, **Compose sets up a single network** for your app
- communication via comtainer name (id)
- but option to specify your own networks with top-level **"networks"** key

### Run Docker Compose

1) create [[docker-compose]] file
2) use [[docker compose up]] command to run services

### Control Startup Order

- you can control the order of service startup and shutdown with the `depends_on` option

### Remove Containers

- all containers will be stopped after we canceled `docker compose up` instance in terminal
- detached mode **starts the containers** in the **background** and leaves them running

>[!note]
>
>*If you want to stop and re-start the containers onlly, you have to execute [[docker compose start]] command*

>[!warning]
>
>*The main difference between `docker compose up|down` and `docker compose start|stop` is that `up|down` removes an existing service and its data, while `start|stop` do not*

### Variables in Docker Compose

>[!danger]
>
>*Do NOT harcode any sensitive data in docker-compose.yaml*

>[!note]
>
>*Anything that is pushed to remote Git repository will stay in the Git repository*


- in ordert to set env variables for terminal session could be used follow command
  
```bash
  export MONGO_ADMIN_USER=admin
  export MONGO_ADMIN_PASS=admin
```

>[!Definition]
>
>***Secrets** is a better way  to use secrets without having to use env variables*

1) define the seret using the top-level secrets element
2) in ht service definition, reference the secret with the secrets attribute

```bash
services:
 myapp:
  image: myapp:latest
  secrets:
   - my_secret
secrets:
 my_secret:
  file: ./my_secret.txt
```

>[!tip]
>
>This permits **granular access control** within a service container via standart filesystem permissions

Steps to push your image into the private docker repository:
1) build an image locally
2) login into the private docker repository (must have be already created)
3) execute `[[docker push]]` command to load the builded image into the repository
4) change `docker-compose.yaml` file in section `build: .` , replce it with `image: myapp-img:latest` instruction

>[!danger]
>
>Limitations od Docker Compose
>
>- Well-suited for local development and **small-scale** deployments (1000 of containers not for Docker Compose)
>- Designed to run containers on a **single** host system
>- Engineers still need to operate the containers **manually**
>  
>  To overcome these issues, use **Kubernetes**



