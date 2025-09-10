В **RabbitMQ** ключевые концепции — это **Exchange** (обменник) и **Queue** (очередь). Они работают вместе, чтобы доставлять сообщения от отправителя (Producer) к получателю (Consumer).

---

## 🏗 **Queue (очередь)**

**Очередь** — это структура данных, куда помещаются сообщения и откуда их забирает обработчик (**Consumer**). Она работает по принципу **FIFO (First In, First Out)**, то есть сообщения обрабатываются в порядке поступления.

- Очередь **гарантирует доставку** сообщений (если Consumer временно недоступен, сообщения остаются в очереди).
- В RabbitMQ можно настроить **персистентность**, чтобы сообщения сохранялись даже после перезапуска брокера.

🔹 **Пример**: Очередь `"order-created-queue"` хранит информацию о новых заказах.

---

## 🔄 **Exchange (обменник)**

**Exchange** — это маршрутизатор сообщений. Он получает сообщения от отправителя (**Producer**) и решает, в какие очереди их отправить.

**Exchange не хранит сообщения**, а только передает их в нужные очереди согласно правилам маршрутизации.

Есть **4 типа Exchange**:

|Тип Exchange|Описание|
|---|---|
|**Direct**|Сообщения идут в конкретную очередь по точному совпадению ключа маршрутизации (routing key).|
|**Fanout**|Шлет сообщения во **все** очереди, привязанные к нему.|
|**Topic**|Направляет сообщения в очереди по шаблону в routing key (например, `order.created`, `user.*`).|
|**Headers**|Направляет сообщения по заголовкам (headers), а не по routing key.|

---

## 📌 **Как они работают вместе?**

1️⃣ **Producer (отправитель)** отправляет сообщение в **Exchange**.  
2️⃣ **Exchange** решает, в какие **Queue** его направить.  
3️⃣ **Consumer (обработчик)** забирает сообщение из очереди и выполняет нужные действия.

🔹 **Пример схемы работы**  
Допустим, у нас есть система заказов, и мы хотим, чтобы информация о новом заказе отправлялась в разные сервисы.

- Exchange: `orders-exchange`
- Очереди:
    - `order-processing-queue` (обрабатывает заказы)
    - `email-notification-queue` (отправляет уведомления клиенту)

Если использовать **Fanout Exchange**, то сообщение о новом заказе попадет сразу в обе очереди.

---

## 🔹 **Пример кода в .NET с RabbitMQ**

### **1️⃣ Отправка сообщения (Producer)**

```csharp
var factory = new ConnectionFactory() { HostName = "localhost" };
using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();

// Создаем exchange и очередь
channel.ExchangeDeclare("orders-exchange", ExchangeType.Fanout);
channel.QueueDeclare("order-processing-queue", durable: true, exclusive: false, autoDelete: false);
channel.QueueDeclare("email-notification-queue", durable: true, exclusive: false, autoDelete: false);

// Привязываем очереди к exchange
channel.QueueBind("order-processing-queue", "orders-exchange", "");
channel.QueueBind("email-notification-queue", "orders-exchange", "");

string message = "New order created!";
var body = Encoding.UTF8.GetBytes(message);

// Публикуем сообщение в Exchange
channel.BasicPublish("orders-exchange", "", null, body);

Console.WriteLine(" [x] Sent '{0}'", message);
```

### **2️⃣ Получение сообщения (Consumer)**

```csharp
using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();

channel.QueueDeclare("order-processing-queue", durable: true, exclusive: false, autoDelete: false);

var consumer = new EventingBasicConsumer(channel);
consumer.Received += (model, ea) =>
{
    var body = ea.Body.ToArray();
    var message = Encoding.UTF8.GetString(body);
    Console.WriteLine(" [x] Received '{0}'", message);
};

channel.BasicConsume("order-processing-queue", autoAck: true, consumer: consumer);
Console.WriteLine(" Press [enter] to exit.");
Console.ReadLine();
```

---

## 🔥 **Вывод**

- **Очередь (Queue)** хранит сообщения, пока их не заберет Consumer.
- **Обменник (Exchange)** направляет сообщения в нужные очереди по правилам маршрутизации.
- **Прямое соединение Producer → Queue не используется**. Producer всегда отправляет в Exchange.
- Можно настроить разные схемы маршрутизации, чтобы один Producer отправлял сообщения в несколько очередей.

Если у тебя есть вопросы или хочешь реализовать это в своем проекте, спрашивай! 😊🚀

## RabbitMQ + Clean Architecture

В **Clean Architecture** логика работы с **RabbitMQ** должна быть реализована в **Application слое**, а не в **API слое**.

---

### 🔥 **Почему RabbitMQ должен быть в Application слое?**

1. **Application слой содержит бизнес-логику**
    
    - Взаимодействие с очередями сообщений — это **часть бизнес-логики**, а не инфраструктуры API.
    - Например, если создается заказ, логика публикации события `OrderCreated` должна быть внутри **Application слоя**.
2. **API слой — это просто транспортный слой (Controller)**
    
    - Контроллеры (`Controllers`) не должны знать о RabbitMQ. Они просто принимают HTTP-запросы и передают данные в **Application слой**.
    - API может использовать **MediatR** для передачи команд в **Application слой**.
3. **Принцип разделения ответственности (SRP)**
    
    - Application слой должен работать с **RabbitMQ через абстракции**, чтобы при необходимости можно было сменить брокер сообщений (например, с RabbitMQ на Azure Service Bus) без изменения бизнес-логики.

---

### ✅ **Как правильно организовать работу с RabbitMQ в Clean Architecture?**

#### **1️⃣ Infrastructure слой**

В слое **Infrastructure** создаем конкретную реализацию для RabbitMQ.

```csharp
public class RabbitMqPublisher : IEventPublisher
{
    private readonly IConnection _connection;
    private readonly IModel _channel;

    public RabbitMqPublisher()
    {
        var factory = new ConnectionFactory() { HostName = "localhost" };
        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();
    }

    public void Publish<T>(T message, string exchange)
    {
        var body = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(message));

        _channel.BasicPublish(exchange: exchange,
                              routingKey: "",
                              basicProperties: null,
                              body: body);
    }
}
```

#### **2️⃣ Application слой**

В **Application слое** определяем интерфейс `IEventPublisher`, который будет абстрагировать работу с брокером сообщений.

```csharp
public interface IEventPublisher
{
    void Publish<T>(T message, string exchange);
}
```

В **Application слое** вызываем публикацию события при выполнении бизнес-логики:

```csharp
public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IEventPublisher _eventPublisher;

    public CreateOrderHandler(IOrderRepository orderRepository, IEventPublisher eventPublisher)
    {
        _orderRepository = orderRepository;
        _eventPublisher = eventPublisher;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var order = new Order { Id = Guid.NewGuid(), CustomerEmail = request.CustomerEmail };
        await _orderRepository.AddAsync(order);

        // Отправляем сообщение в RabbitMQ
        _eventPublisher.Publish(new OrderCreatedEvent { OrderId = order.Id }, "order-exchange");

        return order.Id;
    }
}
```

#### **3️⃣ API слой**

Контроллер просто отправляет команду в **Application слой** через MediatR:

```csharp
[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderCommand command)
    {
        var orderId = await _mediator.Send(command);
        return Ok(new { OrderId = orderId });
    }
}
```

---

### 🔥 **Вывод**

✅ **RabbitMQ должен быть в Application слое**, так как работа с очередями — это **бизнес-логика**, а не транспортный слой API.  
✅ **API слой (Controllers)** должен просто передавать команды в **Application слой** через **MediatR**.  
✅ **Infrastructure слой** реализует конкретную работу с RabbitMQ, но сам Application слой работает через **абстракцию (`IEventPublisher`)**.

Это позволит легко **менять брокер сообщений** или **заменять RabbitMQ на что-то другое** без изменения бизнес-логики.

## Details of implementation

Конечно! Давай разберем пошаговую реализацию RabbitMQ в **Clean Architecture** на **.NET 8**.

---

## 🚀 **Структура проекта (Clean Architecture)**

Твой проект будет иметь следующую структуру:

```
/YourProject
│── /src
│   ├── /YourProject.API             # API слой (контроллеры)
│   ├── /YourProject.Application      # Application слой (бизнес-логика, MediatR)
│   ├── /YourProject.Domain           # Domain слой (сущности, интерфейсы)
│   ├── /YourProject.Infrastructure   # Infrastructure слой (RabbitMQ, база данных)
│── /tests
│── docker-compose.yml                 # Запуск RabbitMQ через Docker
│── YourProject.sln
```

---

# 🛠 **Шаг 1: Установка необходимых пакетов**

### 📌 Устанавливаем библиотеки:

В **YourProject.Application** и **YourProject.Infrastructure** добавляем MediatR и Newtonsoft.Json:

```sh
dotnet add package MediatR.Extensions.Microsoft.DependencyInjection
dotnet add package Newtonsoft.Json
dotnet add package RabbitMQ.Client
```

---

# 🛠 **Шаг 2: Запуск RabbitMQ через Docker**

Создай `docker-compose.yml` в корне проекта:

```yaml
version: '3.8'
services:
  rabbitmq:
    image: "rabbitmq:3-management"
    container_name: "rabbitmq"
    ports:
      - "5672:5672"   # Порт для приложений
      - "15672:15672" # Порт для админ-панели
    environment:
      RABBITMQ_DEFAULT_USER: user
      RABBITMQ_DEFAULT_PASS: password
```

Запусти RabbitMQ:

```sh
docker-compose up -d
```

Теперь RabbitMQ доступен:

- **Админ-панель**: [http://localhost:15672](http://localhost:15672/)
- **Логин**: `user`
- **Пароль**: `password`

---

# 🏗 **Шаг 3: Реализация в коде**

## 📌 **1️⃣ Domain слой (абстракции)**

В **YourProject.Domain** создаем интерфейс `IEventPublisher` для работы с RabbitMQ:

```csharp
public interface IEventPublisher
{
    void Publish<T>(T message, string exchange);
}
```

Создаем **DTO** для события `OrderCreatedEvent`:

```csharp
public class OrderCreatedEvent
{
    public Guid OrderId { get; set; }
    public string CustomerEmail { get; set; }
}
```

---

## 📌 **2️⃣ Infrastructure слой (RabbitMQ)**

В **YourProject.Infrastructure** создаем класс `RabbitMqPublisher`, который реализует `IEventPublisher`:

```csharp
using Newtonsoft.Json;
using RabbitMQ.Client;
using System.Text;
using YourProject.Domain;

public class RabbitMqPublisher : IEventPublisher
{
    private readonly IConnection _connection;
    private readonly IModel _channel;

    public RabbitMqPublisher()
    {
        var factory = new ConnectionFactory()
        {
            HostName = "localhost",
            UserName = "user",
            Password = "password"
        };
        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();

        // Объявляем exchange
        _channel.ExchangeDeclare(exchange: "order-exchange", type: ExchangeType.Fanout);
    }

    public void Publish<T>(T message, string exchange)
    {
        var body = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(message));

        _channel.BasicPublish(exchange: exchange,
                              routingKey: "",
                              basicProperties: null,
                              body: body);
    }
}
```

### 📌 **Добавляем зависимость в `Infrastructure`**

Открываем `InfrastructureServiceCollectionExtensions.cs` и регистрируем `RabbitMqPublisher`:

```csharp
using Microsoft.Extensions.DependencyInjection;
using YourProject.Domain;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
    {
        services.AddSingleton<IEventPublisher, RabbitMqPublisher>();
        return services;
    }
}
```

---

## 📌 **3️⃣ Application слой (Бизнес-логика)**

В **YourProject.Application** создаем команду `CreateOrderCommand` и обработчик:

```csharp
using MediatR;
using YourProject.Domain;

public class CreateOrderCommand : IRequest<Guid>
{
    public string CustomerEmail { get; set; }
}

public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IEventPublisher _eventPublisher;

    public CreateOrderHandler(IEventPublisher eventPublisher)
    {
        _eventPublisher = eventPublisher;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var orderId = Guid.NewGuid();

        // Отправляем сообщение в RabbitMQ
        var orderEvent = new OrderCreatedEvent { OrderId = orderId, CustomerEmail = request.CustomerEmail };
        _eventPublisher.Publish(orderEvent, "order-exchange");

        return orderId;
    }
}
```

### 📌 **Регистрируем MediatR**

Добавляем в `ApplicationServiceCollectionExtensions.cs`:

```csharp
using Microsoft.Extensions.DependencyInjection;
using MediatR;
using System.Reflection;

public static class ApplicationServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        return services;
    }
}
```

---

## 📌 **4️⃣ API слой (Контроллер)**

В **YourProject.API** создаем `OrdersController`:

```csharp
using MediatR;
using Microsoft.AspNetCore.Mvc;
using YourProject.Application;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command)
    {
        var orderId = await _mediator.Send(command);
        return Ok(new { OrderId = orderId });
    }
}
```

### 📌 **Регистрируем зависимости в `Program.cs`**

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

---

# 🛠 **Шаг 4: Запуск и тестирование**

### 📌 **1️⃣ Запускаем RabbitMQ**

```sh
docker-compose up -d
```

### 📌 **2️⃣ Запускаем API**

```sh
dotnet run --project YourProject.API
```

### 📌 **3️⃣ Тестируем API**

Открываем **Postman** и делаем `POST` запрос:

**URL**: `http://localhost:5000/api/orders`  
**Body (JSON)**:

```json
{
  "customerEmail": "user@example.com"
}
```

**Ожидаемый ответ**:

```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Проверяем **RabbitMQ** в [http://localhost:15672](http://localhost:15672/)  
Заходим в **Exchanges** → **order-exchange** → **Queues** → **Сообщение появилось!**

---

# 🎯 **Вывод**

✅ **API слой** не знает о RabbitMQ, а просто вызывает команду.  
✅ **Application слой** содержит бизнес-логику и вызывает `IEventPublisher`.  
✅ **Infrastructure слой** реализует `RabbitMqPublisher`, который отправляет сообщения.  
✅ **RabbitMQ** используется по **чистой архитектуре**, отделяя слои друг от друга.

Если есть вопросы — спрашивай! 🚀😊