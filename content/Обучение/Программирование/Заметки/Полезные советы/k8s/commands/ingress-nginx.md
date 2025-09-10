
show pods and containers

1) get ingress namespce

```bash
kubectl get namespaces
```

2) get pod for ingress-nginx

```bash
kubectl get pods --namespace=ingress-nginx
```

3) show ingress services

```bash
kubectl get services --namespace=ingress-nginx
```