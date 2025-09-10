```yaml
apiVersion: v1
kind: Service
metadata:
  name: platforms-clusterip-srv
spec:
  type: ClusterIP
  selector:
    app: platformservice
  ports:
    - name: platformservice
      protocol: TCP
      port: 8080 # порт, на котором ваш ClusterIP сервис будет доступен другим объектам в кластере
      targetPort: 8080 # порт, на котором приложение слушает внутри контейнера
```

Kubernetes перенаправляет трафик с `port` на указанный `targetPort` контейнера