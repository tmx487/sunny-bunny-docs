Это **общая концепция**, поддерживаемая многими системами обмена сообщениями и брокерами.

---

## 📦 Где ещё есть поддержка DLQ:

|Платформа / Брокер|Есть DLQ?|Комментарий|
|---|---|---|
|**RabbitMQ**|✅ Да|Через `x-dead-letter-exchange` и `x-dead-letter-routing-key`|
|**Apache Kafka**|🔧 Не встроено напрямую|Но можно реализовать DLQ вручную (через отдельный topic)|
|**Amazon SQS**|✅ Да|Встроенная поддержка DLQ и retry count|
|**Azure Service Bus**|✅ Да|Встроено, можно настраивать поведение для DLQ|
|**Google Pub/Sub**|✅ Да|DLQ через retry policy + topic forwarding|
|**ActiveMQ / Artemis**|✅ Да|DLQ через политики ошибок|

---

## 🔍 Подробнее:

### 🐇 RabbitMQ:

- Автоматически перенаправляет сообщения в DLX (Dead Letter Exchange), если:
    
    - Истек TTL (время жизни сообщения),
        
    - Достигнут max-length очереди,
        
    - Сообщение было отклонено (`basic.reject`) без повторной обработки.
        
- DLX сам маршрутизирует в другую очередь (DLQ).
    

### 🦁 Kafka:

- Kafka **по архитектуре не удаляет сообщения** — они всегда доступны, пока не истек retention.
    
- Но: ты можешь вручную создать `orders.DLQ` и туда писать "плохие" события, если не удалось их обработать.
    

Пример:

```csharp
try {
    ProcessMessage(message);
} catch (Exception ex) {
    await _kafkaProducer.ProduceAsync("orders.dlq", message);
}
```

Или использовать фреймворк, например, **Kafka Streams**, **Akka Streams**, **Confluent ksqlDB**, где DLQ реализуется через process-failure policy.

---

## ✅ Итого:

- DLQ — **общий паттерн обработки ошибок** в системах доставки сообщений.
    
- Поддержка есть **почти везде**, но **в Kafka — вручную**, а в **RabbitMQ/SQS/Azure** — из коробки.