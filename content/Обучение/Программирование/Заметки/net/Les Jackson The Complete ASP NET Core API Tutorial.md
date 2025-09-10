### API

![[Pasted image 20241226120116.png]]

Create a new web API project

```bash
dotnet new web -n CommandAPI
```

Create a new xUnit Tests project

```bash
dotnet new xunit -n CommandAPI.Tests
```

- `-n`: means `name`

>[!note]
>
>If do not work into Visual Sdutio use `dotnet new sln --name CommandAPISolution` command to create a new `.sln` file


Associate new `.csproj` files to the existing solution

```bash
dotnet sln CommandAPISolution.sln add src/CommandAPI/CommandAPI.csproj test/
CommandAPI.Tests/CommandAPI.Tests.csproj
```

Add reference to project from power shell

```bash
dotnet add test/CommandAPI.Tests/CommandAPI.Tests.csproj reference src/
CommandAPI/CommandAPI.csproj
```

A high-level representation of the architecture for our API

![[Pasted image 20241226124300.png]]

![[Pasted image 20241226124439.png]]

![[Pasted image 20241226124522.png]]

>[!note]
>
>Create an old fashioned WebAPI Project from cmd
>
>`dotnet new webapi --use-program-main -n YourProjectName`

![[Pasted image 20250110130848.png]]

- pvc secret:
  mssql, SA_PASSWORD="3ge5ss9*"

```bash
kubectl create secret generic mssql --from-literal=SA_PASSWORD="3ge5ss9*"
```

install `ingress`

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/cloud/deploy.yaml
```

Если образ был запушен в docker hub и после этого были внесены изменения в код, нужно сделать следующее, чтобы изменения стали активными:
1) пересобрать образ при помощи `docker build`
2) запушить новый образ в `docker hub ` при помощи `docker push`
3) передеплоить образ в `k8s`  при помощи `kubectl rollout restart deployment <deployment_name>`

![[Pasted image 20250121125441.png]]
### Multi-Resources URIs

![[Pasted image 20250121131331.png]]

### RabbitMQ: asynchronous messaging

RabbitMQ provides next types of exchange:
- direct
- fanout
- topic
- header

![[Pasted image 20250121182726.png]]

![[Pasted image 20250121182803.png]]

![[Pasted image 20250121182855.png]]

>We are going to use fanout exchange

![[Pasted image 20250123124337.png]]

![[Pasted image 20250123124425.png]]

>Grpc.AspNetCore package has been installed into PlatformService (in our case this service is a server)
>For supporting `grpc` as a client (see CommandService) we have to install the next packages: `Grpc.Tools`, `Grpc.Net.Client`, `Google.Protobuf`

After addition of `proto` files we need to generate or write the next lines into `.csproj` file:

```csproj
<ItemGroup>
	<Protobuf Include="Protos\platforms.proto" GrpcServices="Server" />
</ItemGroup>
```

>gRPC — **синхронный по своей природе**, хотя в .NET используется модель `async/await`.

### **Как сделать gRPC взаимодействие более асинхронным?**

Если вы хотите снизить связанность, можно комбинировать gRPC с асинхронными подходами:

1. **Паттерн "Запрос-Ответ через очередь"**:
    
    - Отправляете запрос через очередь (например, RabbitMQ).
    - Получаете ответ в отдельном процессе или сервисе.
2. **Сохранение результата где-то (например, в БД)**:
    
    - Клиент делает gRPC-запрос.
    - Сервер записывает результат в БД или другой хранилище.
    - Клиент периодически запрашивает результат из БД.
3. **Между gRPC и Event-driven архитектурой**:
    
    - Используйте gRPC для критичных запросов, а RabbitMQ/Kafka для фоновой обработки или событий.


Add the next lines into `CommandService.csproj` file

```csproj
<ItemGroup>
	<Protobuf Include="Protos\platforms.proto" GrpcServices="Client" />
</ItemGroup>
```