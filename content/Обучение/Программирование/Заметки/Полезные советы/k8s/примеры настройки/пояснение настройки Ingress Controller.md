```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations: 
    nginx.ingress.kubernetes.io/use-regex: 'true'
spec:
  rules:
    - host: acme.com
      http:
        paths:
          - path: /api/v1/platforms
            pathType: Prefix
            backend:
              service:
                name: platforms-clusterip-srv
                port:
                  number: 8080
          - path: /api/v1/c/platforms
            pathType: Prefix
            backend:
              service:
                name: commands-clusterip-srv
                port:
                  number: 8080
   
  ingressClassName: nginx
---
apiVersion: v1
kind: Service
metadata:
  name: ingress-nginx-controller
  namespace: ingress-nginx
spec:
  type: NodePort
  ports:
    - name: http
      protocol: TCP
      port: 8080        # Порт, который будет слушать Ingress
      targetPort: 80    # Порт, на который будет перенаправляться внутри Ingress
  selector:
    app.kubernetes.io/name: ingress-nginx

```

Этот манифест конфигурирует два объекта в Kubernetes: **Ingress** и **Service**. Они работают вместе для маршрутизации HTTP-запросов внутри кластера

---
### 1. **Ingress**

Это объект, который управляет маршрутизацией HTTP/HTTPS-запросов из внешней сети или внутри кластера к сервисам. Он описан следующим образом:

#### Поля:

- **`apiVersion: networking.k8s.io/v1` и `kind: Ingress`**  
    Указывает, что это объект типа Ingress.
    
- **`metadata.name: ingress-srv`**  
    Имя Ingress-ресурса — `ingress-srv`.
    
- **`annotations`**  
    Аннотация `nginx.ingress.kubernetes.io/use-regex: 'true'` позволяет использовать регулярные выражения в правилах путей.
    
- **`spec.rules`**  
    Описывает правила маршрутизации.
    

#### Правила (`rules`):

1. **Хост:** `acme.com`  
    Запросы, отправленные на этот домен, будут маршрутизироваться.
    
2. **HTTP-пути (`paths`)**:
    
    - **`/api/v1/platforms`**  
        Запросы с префиксом `/api/v1/platforms` перенаправляются на сервис `platforms-clusterip-srv` (порт 8080).
        
    - **`/api/v1/c/platforms`**  
        Запросы с префиксом `/api/v1/c/platforms` перенаправляются на сервис `commands-clusterip-srv` (порт 8080).
        
3. **`pathType: Prefix`**  
    Указывает, что запросы перенаправляются, если путь запроса начинается с указанного значения (`/api/v1/platforms` или `/api/v1/c/platforms`).
    
4. **Backend (службы):**
    
    - `service.name: platforms-clusterip-srv`: Сервис для платформ.
    - `service.port.number: 8080`: Порт, на который перенаправляется запрос.

---

### 2. **Service**

Это объект, который предоставляет сетевой доступ к Ingress-контроллеру (например, nginx).

#### Поля:

- **`apiVersion: v1` и `kind: Service`**  
    Указывает, что это объект типа Service.
    
- **`metadata.name: ingress-nginx-controller`**  
    Имя сервиса, который будет связан с Ingress-контроллером.
    
- **`namespace: ingress-nginx`**  
    Сервис создан в пространстве имен `ingress-nginx`.
    
- **`spec.type: NodePort`**  
    Указывает, что сервис открывает порт на каждом узле кластера, доступный снаружи.
    
- **Порты:**
    
    - **`port: 8080`**  
        Порт, на котором слушает сервис (внешний порт).
    - **`targetPort: 80`**  
        Внутренний порт, на который перенаправляется трафик. Это порт, на котором работает Ingress-контроллер.
- **`selector`**  
    Указывает, какие поды связывать с этим сервисом. В данном случае, это поды с меткой `app.kubernetes.io/name: ingress-nginx`.
    

---

### Поток запросов

1. Запрос приходит на **[http://acme.com/api/v1/platforms](http://acme.com/api/v1/platforms)**.
2. Он перенаправляется на **порт 8080** (NodePort) в сервисе `ingress-nginx-controller`.
3. Сервис отправляет запрос на **порт 80** в Ingress-контроллере.
4. Ingress-контроллер маршрутизирует запрос на **сервис `platforms-clusterip-srv`** на порт 8080.
5. Сервис `platforms-clusterip-srv` отправляет запрос в контейнер, где приложение обрабатывает его.