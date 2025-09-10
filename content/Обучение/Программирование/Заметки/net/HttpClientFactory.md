Отличные вопросы. Давай по порядку:

---

## ✅ 1) Как добавить **Polly** при использовании `HttpClientFactory`

Ты можешь **добавить политику повторных попыток, таймаутов, circuit breaker'ов и т. д.**, когда регистрируешь `HttpClient`.

### 📌 Пример: добавим Polly с `Retry` и `CircuitBreaker`

```csharp
builder.Services.AddHttpClient<IInventoryService, InventoryServiceClient>(client =>
{
    client.BaseAddress = new Uri("https://inventory-service");
})
.AddPolicyHandler(GetRetryPolicy())
.AddPolicyHandler(GetCircuitBreakerPolicy());
```

### 🔧 Определим политики Polly:

```csharp
static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
            onRetry: (response, timespan, retryCount, context) =>
            {
                Console.WriteLine($"Retry {retryCount} after {timespan.TotalSeconds} sec.");
            });
}

static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .CircuitBreakerAsync(
            handledEventsAllowedBeforeBreaking: 3,
            durationOfBreak: TimeSpan.FromSeconds(30));
}
```

> `HandleTransientHttpError()` автоматически обрабатывает:
> 
> - `5xx` ошибки
>     
> - `408 Request Timeout`
>     
> - `HttpRequestException`
>     

---

## ✅ 2) Что делать, если **сервис делает запросы к нескольким микросервисам**

Ты можешь создать **несколько именованных или типизированных `HttpClient`** — для каждого внешнего сервиса.

---

### 🔹 Вариант 1: Typed-клиенты (предпочтительно)

```csharp
builder.Services.AddHttpClient<IInventoryService, InventoryServiceClient>(client =>
{
    client.BaseAddress = new Uri("https://inventory-service");
}).AddPolicyHandler(GetRetryPolicy());

builder.Services.AddHttpClient<IPaymentService, PaymentServiceClient>(client =>
{
    client.BaseAddress = new Uri("https://payment-service");
}).AddPolicyHandler(GetRetryPolicy());
```

- Каждый клиент (Inventory, Payment...) имеет свой base URL, retry и конфигурацию.
    
- Удобно для **инкапсуляции логики HTTP внутри клиента.**
    

---

### 🔹 Вариант 2: Named Clients (если не нужен отдельный интерфейс на каждый сервис)

```csharp
builder.Services.AddHttpClient("Inventory", client =>
{
    client.BaseAddress = new Uri("https://inventory-service");
});

builder.Services.AddHttpClient("Payment", client =>
{
    client.BaseAddress = new Uri("https://payment-service");
});
```

Используешь в коде так:

```csharp
public class OrderSaga
{
    private readonly IHttpClientFactory _factory;

    public OrderSaga(IHttpClientFactory factory)
    {
        _factory = factory;
    }

    public async Task DoWorkAsync()
    {
        var inventoryClient = _factory.CreateClient("Inventory");
        var paymentClient = _factory.CreateClient("Payment");

        var result = await inventoryClient.PostAsync("/api/reserve", ...);
    }
}
```

---

### 🔸 Когда какой подход выбрать?

|Подход|Когда использовать|
|---|---|
|**Typed-клиенты**|✅ когда есть обёртка/интерфейс, хочешь чистую абстракцию|
|**Named-клиенты**|🔧 когда хочешь вручную выбирать клиент по имени|
|**Factory напрямую**|когда клиентов много и нужны динамические настройки|

---

## 📦 Итог

1. Используй `AddHttpClient` с `.AddPolicyHandler(...)` — это удобно и надёжно.
    
2. Для каждого микросервиса делай **свой `HttpClient`**:
    
    - через **типизированные клиенты** — самый чистый подход (если есть интерфейс);
        
    - или через **именованные**, если нужна гибкость.
        
3. Используй Polly для `Retry`, `Timeout`, `CircuitBreaker`.
    

---

Хочешь — могу показать, как объединить это с OpenTelemetry и логами, или как организовать fault-tolerant вызовы с fallback.