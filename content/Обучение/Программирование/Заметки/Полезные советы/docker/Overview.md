### General

- docker images **are versioned**
- different versions are identified by **tags** (docker tags are used to identify **images by name**, *see the example below*)
![[Pasted image 20241022122533.png]]
- `latest` tag mostly refers to the newest release

>*Using a specific version of image is best practice in most cases*

- in order to download image from docker hub use [[docker pull]] command
- docker hub registry (docker.io) is **used by default**
- docker generates a ranmod name for the container if you do not specify one
- docker pulls image automatically, if it does not find it locally (this means if you run `docker run` command with name of a container which does not exist locally, docker will pull it from the docker hub automatically)

### Port Binding

- application inside container runs in an **isolated docker network** (this allows us ti run the same app running on **the same port multiple times**)
- we need to **expose** the container port **to the host** (the machine the container runs on)

>***Port Binding**: Bind the container's port to the host's port to make the service available to the outside world (see the picture below)*

![[Pasted image 20241022140955.png|400]]

- standart to use the same port on your host as container is using
  
  ![[Pasted image 20241022142152.png|400]]
  

### Public and Private Docker Registries

![[Pasted image 20241022143247.png]]

- you need to authenticate before accessing the registry
- all big cloud providers offer private registries (Amazon ECR, Google Container Registry, etc.)
- Nexus (popular artifact repository manager)

#### Registry vs Repository

Docker Registry

- a service providing storage
- can be hosted by a third party, like AWS, or by youself
- **collection of repositories**

Docker Repository

- **collection of related images** with the same name but different versions

### Building own Docker Images

1) create a [[Dockerfile structure|Dockerfile]]
2) [[docker build|build image]] from the Dockerfile

>[!note]
>
>*A Docker image consists of layers*
>
>***Each instruction in the Dockerfile creates one layer***
>
>*These layers are stacked & each one is a delta of the changes from the previous layer*

3) [[docker run|create container and run it]]

### How Docker fits in in the complete development and deploymnet process

![[Pasted image 20241022180834.png]]

### Docker Volumes

There are two ways to store data into docker:
- common ways:
	- docker volumes (тома хранения данных)
	- bind mount (монтирование каталогов с хост)
- specific ways:
	- named pipes, only for Windows (именованные каналы)
	- tmpfs, only for Linux (монтирование tmpfs)

![[Pasted image 20241116114233.png]]

```yaml
# docker-compose.yaml
...

volumes:
 - [host_dir]:[virt_dir]

...
```

- `[host_dir]` - path to physical directory on host (current) machine
- `[virt_dir]` - path to directory into virtual machine


![[Pasted image 20241116115235.png]]

