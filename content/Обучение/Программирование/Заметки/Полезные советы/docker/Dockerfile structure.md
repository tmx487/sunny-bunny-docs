
Dockerfile starts from a parent image of **base image**

### Structure

```dockerfile
FROM {base_image} # build this image from the specified image

COPY {file} <from-path> <to-path> # copies files or directories from one folder to another one

WORKDIR {dir}

RUN {command} # will execute any command in a shell
              # inside the container environment

CMD {instruction}
```

>*While `RUN` is executed in the container, `COPY` is executed on the host*

`WORKDIR` sets the working directory for all following commands like changing into a directory: `cd ..`

`CMD`:
- the instruction that is to be executed when a Docker container starts
- there **can only be one** `CMD` instruction in a Dockerfile

```dockerfile
FROM node:19-alpine # install node

COPY package.json /app/
COPY src /app/

WORKDIR /app

RUN npm install

CMD ["node", "server.js"]
```