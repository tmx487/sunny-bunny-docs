```cs
 using var scope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
            ["BotToken"] = MaskToken(botToken),
            ["UpdateId"] = update.UpdateId
        });
```


`BeginScope` создает **контекст логирования**, который автоматически добавляет дополнительную информацию ко всем записям в логах внутри этого scope'а.

## Основные преимущества BeginScope:

### 🎯 **1. Автоматический контекст**

```csharp
// Вместо этого в каждом логе:
_logger.LogInfo("Message", updateId, botToken, correlationId);

// Пишем один раз в scope:
using var scope = _logger.BeginScope(new { UpdateId = updateId });
_logger.LogInfo("Message"); // Автоматически содержит UpdateId!
```

### 🔍 **2. Легкая фильтрация логов**

```bash
# Найти все логи конкретного webhook'а:
grep "CorrelationId: abc-123-def" app.log

# Найти все логи конкретного бота:
grep "BotToken: 123***789" app.log

# Найти все ошибки конкретного пользователя:
grep "UserId: 987654321" app.log | grep ERROR
```

### 📊 **3. Структурированное логирование**

```json
// В JSON формате каждый лог будет содержать:
{
  "timestamp": "2024-01-15T10:30:01Z",
  "level": "Information", 
  "message": "Webhook обработан успешно",
  "properties": {
    "CorrelationId": "abc-123-def",
    "BotToken": "123***789",
    "UpdateId": 123456,
    "UserId": 987654321,
    "ChatId": 987654321
  }
}
```

### 🚀 **4. Troubleshooting и мониторинг**

**Scenario 1: Ошибка в продакшене**

```
[ERROR] Ошибка обработки webhook
CorrelationId: abc-123-def, BotToken: 123***789, UpdateId: 123456

# Теперь можно найти ВСЕ логи этого запроса:
grep "CorrelationId: abc-123-def" logs/
```

**Scenario 2: Медленные запросы**

```csharp
using var scope = _logger.BeginScope(new { 
    CorrelationId = correlationId,
    StartTime = DateTime.UtcNow 
});

// В конце:
_logger.LogInformation("Processed in {ElapsedMs}ms", stopwatch.ElapsedMilliseconds);
```

### 🔄 **5. Вложенные scope'ы**

```csharp
// Контроллер
using var mainScope = _logger.BeginScope(new { CorrelationId = "abc-123" });

// Сервис добавляет свой контекст
using var serviceScope = _logger.BeginScope(new { ServiceName = "MessageProcessor" });

// Результат: все логи содержат И CorrelationId И ServiceName!
```

## На собеседовании могут спросить:

**"Зачем нужен CorrelationId?"**

- Связывает все логи одного запроса
- Помогает отлаживать проблемы в распределенных системах
- Можно передавать между микросервисами

**"Что произойдет, если забыть using?"**

- Scope не закроется автоматически
- Может произойти memory leak
- Контекст будет "протекать" в другие запросы

65
- Structured logging с параметрами в каждом вызове
- Middleware для автоматического контекста
- Библиотеки типа Serilog.Context

BeginScope делает логи **читаемыми**, **фильтруемыми** и **отслеживаемыми** - это критически важно для production систем!