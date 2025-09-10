Чтобы запустить под в Kubernetes, используя локальный Docker образ, нужно выполнить несколько шагов. Поскольку Kubernetes не может напрямую использовать локальные образы Docker, вам нужно либо загрузить локальный образ в Docker Registry, либо использовать методы, которые позволяют передать локальный образ в кластер. Вот несколько способов это сделать:

### Способ 1: Использование локального образа в Docker Desktop (для Kubernetes, запущенного через Docker Desktop)

Если у вас настроен Kubernetes через Docker Desktop, вы можете использовать локальные образы, собранные в Docker, в Kubernetes.

1. **Построение образа локально:**
    
    Сначала создайте образ на вашей локальной машине с помощью Docker:
    
    ```bash
    docker build -t your-image-name:latest .
    ```
    
2. **Загрузка локального образа в Kubernetes (если используете Docker Desktop):**
    
    Если Kubernetes работает через Docker Desktop, вы можете использовать локальные образы напрямую без дополнительных настроек. Просто укажите имя локального образа в манифесте Kubernetes:
    
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: my-local-image-deployment
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: my-app
      template:
        metadata:
          labels:
            app: my-app
        spec:
          containers:
          - name: my-container
            image: your-image-name:latest  # Локальный образ
    ```
    
3. **Примените манифест:**
    
    После этого вы можете применить ваш манифест в Kubernetes:
    
    ```bash
    kubectl apply -f your-deployment.yaml
    ```
    

### Способ 2: Использование `minikube` (если у вас Minikube)

Если вы используете Minikube, вам нужно загрузить локальный Docker образ в кластер Minikube. В этом случае вам нужно будет использовать команду `minikube image load`.

1. **Запуск Minikube:**
    
    Если Minikube еще не запущен, запустите его:
    
    ```bash
    minikube start
    ```
    
2. **Загрузите локальный образ в Minikube:**
    
    С помощью команды `minikube image load` вы можете загрузить локальный образ Docker в кластер Minikube:
    
    ```bash
    minikube image load your-image-name:latest
    ```
    
3. **Примените манифест:**
    
    Теперь вы можете использовать этот образ в Kubernetes. В манифесте указывайте название локального образа:
    
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: my-local-image-deployment
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: my-app
      template:
        metadata:
          labels:
            app: my-app
        spec:
          containers:
          - name: my-container
            image: your-image-name:latest
    ```
    
    Примените манифест:
    
    ```bash
    kubectl apply -f your-deployment.yaml
    ```
    

### Способ 3: Использование частного Docker Registry

Если вы хотите использовать локальный образ на другом кластере Kubernetes, вам нужно загрузить образ в приватный Docker Registry (например, Docker Hub, Amazon ECR или другой), а затем настроить Kubernetes для доступа к этому реестру.

1. **Авторизация в Docker Registry (если нужно):**
    
    Если вы используете частный реестр, сначала выполните вход в Docker Registry:
    
    ```bash
    docker login
    ```
    
2. **Запушьте локальный образ в реестр:**
    
    После того как вы создали локальный образ, запушьте его в ваш реестр:
    
    ```bash
    docker tag your-image-name:latest your-docker-registry/your-image-name:latest
    docker push your-docker-registry/your-image-name:latest
    ```
    
3. **Используйте образ из реестра в манифесте Kubernetes:**
    
    В вашем манифесте указывайте образ из реестра:
    
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: my-deployment
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: my-app
      template:
        metadata:
          labels:
            app: my-app
        spec:
          containers:
          - name: my-container
            image: your-docker-registry/your-image-name:latest
    ```
    
4. **Примените манифест:**
    
    После этого вы можете применить манифест в Kubernetes:
    
    ```bash
    kubectl apply -f your-deployment.yaml
    ```
    

### Способ 4: Использование `kind` (Kubernetes in Docker)

Если вы используете **kind** для создания локальных кластеров Kubernetes, вы можете загрузить локальный образ в кластер с помощью команды `kind load`:

1. **Запустите кластер kind:**
    
    Если кластер еще не запущен:
    
    ```bash
    kind create cluster
    ```
    
2. **Загрузите локальный образ в kind:**
    
    Чтобы загрузить локальный Docker образ в кластер kind, используйте команду:
    
    ```bash
    kind load docker-image your-image-name:latest
    ```
    
3. **Примените манифест:**
    
    После загрузки образа используйте его в манифесте Kubernetes:
    
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: my-deployment
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: my-app
      template:
        metadata:
          labels:
            app: my-app
        spec:
          containers:
          - name: my-container
            image: your-image-name:latest
    ```
    
    Примените манифест:
    
    ```bash
    kubectl apply -f your-deployment.yaml
    ```
    

### Итог

Если вы используете Docker Desktop с Kubernetes, то можете напрямую использовать локальные образы, указав их в манифесте Kubernetes. Для других случаев, таких как Minikube или kind, нужно загрузить образ в кластер с помощью команд, специфичных для этих инструментов. В случае работы с реестром Docker, загрузите образ в реестр и используйте его в Kubernetes через правильный URL.