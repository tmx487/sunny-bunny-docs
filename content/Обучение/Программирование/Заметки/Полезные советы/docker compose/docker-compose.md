```yaml
version: '3.8'
name: some_docker_conpose_file_name # название контейнета; по умолчанию будет
									# сформировано из пути, по которому
									# находится docker-compose.yaml

services:
	my-app:
	 build: . # to build an app using Dockerfile of the app
	 container_name: my_container_name
	 ports:
	  - 3000:3000 # host:container
	 environment:
	  MONGO_DB_USERNAME: ${MONGO_ADMIN_USER} # env variable
	  MONGO_DB_PSW: ${MONGO_ADMIN_PASS}
	mongodb: # container name
	 image: mongo
	 ports:
	  - 27017:27017 # host:container
	 environment:
	  MONGO_INITDB_ROOT_USERNAME: ${MONGO_ADMIN_USER}
	  MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ADMIN_PASS}
	  
	mongo-express:
	 image: mongo-express
	 ports:
	  - 8081:8081 # host:container
	 environment:
	  ME_CONFIG_MONGODB_ADMINUSERNAME: ${MONGO_ADMIN_USER}
	  ME_CONFIG_MONGODB_ADMINPASSWORD: ${MONGO_ADMIN_PASS}
	  ME_CONFIG_MONGODB_SERVER: mongodb
	 depends_on:
	  - "mongodb"
	
	# another-service:
```

- `version` - is version of docker-compose, must be compatible with Compose installed locally 
- `service` - list of services or containers which we want to run

>[!warning]
>
>*If we have a list of elements like `ports`, we must use `-`, else we do not have to use it (like `environment` section)*

![[Pasted image 20241116125544.png|300]]

>[!warning]
>
>Если в `docker-compose.yaml` указан и `.env` файл, и секция `environment`, то `environment` имеет больший приоритет и будет перезаписывать то, что есть в ` .env` файле


### Якори

```yaml
# example #1

volumes:
	db-data: &defaut-volume
		driver: default
	metrics: *default-volume
```

```yaml
# example #2

services:
	first:
		 my-image-:latest
		 environment: &env
			 - CONFIG_KEY
			 - EXAMPLE_KEY
			 - DEMO_VAR
	second:
		image: another-image:latest
		environment: *env
```

![[Pasted image 20241116132123.png|300]]

![[Pasted image 20241116132158.png|300]]

### Extensions

![[Pasted image 20241116132312.png|300]]

### Merge

![[Pasted image 20241116132518.png|300]]

![[Pasted image 20241116132534.png|300]]

### Подключение других `compose` файлов

![[Pasted image 20241116132731.png]]


