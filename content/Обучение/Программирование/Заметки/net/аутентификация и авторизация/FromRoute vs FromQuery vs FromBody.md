Твой код не работает из-за того, что `[FromRoute]` используется для получения значений из URL, но твой `ConfirmEmailRequest` — это **класс (record), содержащий несколько свойств**, и ASP.NET не умеет автоматически извлекать значения для него из параметров маршрута.

### 🔍 **Что происходит?**

ASP.NET ищет `UserId` и `Token` в **пути запроса** (URL), но так как он работает с моделью `ConfirmEmailRequest`, он ожидает **единый параметр** в маршруте, а не два отдельных.

### ✅ **Как исправить?**

#### **1. Использовать [FromQuery] (если передача через query-параметры)**

Если `UserId` и `Token` передаются в URL **как query-параметры**, например:

```
GET /api/auth/confirm-email?userId=123&token=abc
```

То код метода должен быть таким:

```csharp
public async Task<IActionResult> ConfirmEmail(
    [FromQuery] ConfirmEmailRequest request, 
    CancellationToken cancellationToken)
```

🔹 **Теперь ASP.NET будет брать `userId` и `token` из query-параметров.**

---

#### **2. Использовать [FromRoute] правильно (если передача через сегменты маршрута)**

Если ты хочешь передавать `UserId` и `Token` **в URL как часть маршрута**, например:

```
GET /api/auth/confirm-email/123/abc
```

То тебе нужно **изменить маршрут** и аннотации в контроллере:

```csharp
[HttpGet("confirm-email/{userId}/{token}")]
public async Task<IActionResult> ConfirmEmail(
    [FromRoute] ConfirmEmailRequest request, 
    CancellationToken cancellationToken)
```

🔹 **Теперь ASP.NET сможет автоматически подставлять параметры из маршрута в модель `ConfirmEmailRequest`.**

---

#### **3. Использовать [FromBody] (если передача через JSON)**

Если ты отправляешь `userId` и `token` в **теле запроса (JSON)**, например:

```json
{
  "userId": "123",
  "token": "abc"
}
```

Тогда метод должен быть таким:

```csharp
[HttpPost("confirm-email")]
public async Task<IActionResult> ConfirmEmail(
    [FromBody] ConfirmEmailRequest request, 
    CancellationToken cancellationToken)
```

🔹 **Этот вариант подходит, если запрос — `POST` и данные отправляются в `body`.**

---

### 💡 **Вывод**

- Используй **`[FromQuery]`**, если параметры идут через `?userId=...&token=...`
- Используй **`[FromRoute]` и настрой маршрут**, если параметры идут в `/{userId}/{token}`
- Используй **`[FromBody]`**, если отправляешь JSON-тело в `POST`-запросе.

❓ **Как ты передаёшь данные в запросе? Тогда подскажу, какой вариант лучше.** 🚀