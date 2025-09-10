При сбросе пароля процесс должен быть безопасным и удобным для пользователя. Вот общий сценарий:

---

### **🔹 1. Пользователь запрашивает сброс пароля**

- Вводит email в форме "Забыли пароль?"
- Отправляется запрос на сервер

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

---

### **🔹 2. Сервер проверяет email и отправляет письмо**

- Если email существует, генерируется **уникальный токен** (обычно JWT или GUID)
- Токен кодируется в URL и отправляется на почту
- Этот URL ведет на страницу смены пароля

📧 **Пример письма (HTML + текстовая версия):**

#### `reset_password_template.html`

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Сброс пароля</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { width: 100%; max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 8px; text-align: center; }
        .button { display: inline-block; background-color: #ff5a5f; color: white; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Сброс пароля</h2>
        <p>Вы запросили сброс пароля. Нажмите кнопку ниже, чтобы задать новый пароль:</p>
        <a href="{{reset_link}}" class="button">Сбросить пароль</a>
        <p>Если кнопка не работает, используйте ссылку:</p>
        <p>{{reset_link}}</p>
        <p>Если вы не запрашивали сброс, просто проигнорируйте это письмо.</p>
    </div>
</body>
</html>
```

#### `reset_password_template.txt`

```
Сброс пароля

Вы запросили сброс пароля. Перейдите по ссылке, чтобы задать новый пароль:

{{reset_link}}

Если вы не запрашивали сброс, просто проигнорируйте это письмо.
```

---

### **🔹 3. Пользователь переходит по ссылке**

- Фронтенд показывает форму смены пароля
- Токен из URL отправляется на сервер вместе с новым паролем

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "email": "user@example.com",
  "newPassword": "NewSecureP@ssword123",
  "confirmPassword": "NewSecureP@ssword123"
}
```

---

### **🔹 4. Сервер проверяет токен и меняет пароль**

- Декодирует и валидирует токен
- Сравнивает email из токена с email в запросе
- Обновляет хешированный пароль в БД
- Удаляет использованный токен (если он хранился в БД)
- Отправляет **успешный ответ** пользователю

```json
{
  "message": "Ваш пароль был успешно изменен."
}
```

---

### **🔹 5. Пользователь может войти с новым паролем**

После сброса пароля пользователь вводит новый пароль и входит в систему.

---

### **📌 Важные моменты безопасности**

✔️ **Срок действия токена** (обычно 15-60 минут)  
✔️ **Ограничение числа запросов** (Rate Limiting)  
✔️ **Зашифрованный JWT или GUID**  
✔️ **Хеширование пароля перед сохранением**  
✔️ **Выход со всех устройств после сброса пароля** (опционально)

---

### **📌 Итог**

- **Пользователь отправляет email** → сервер создает токен
- **Письмо со ссылкой отправляется на email**
- **Пользователь вводит новый пароль**
- **Сервер валидирует токен и обновляет пароль**
- **Пользователь входит в систему с новым паролем**

🚀 Готово! Теперь это удобный и безопасный процесс.


## ⚡**Важно**

Сам по себе `Reset Password` **не используется** – он всегда идёт **как вторая часть** после `Forgot Password`.

### **🔹 Почему?**

Чтобы выполнить сброс пароля (`Reset Password`), требуется **токен**, который выдаётся только после запроса "Забыл пароль" (`Forgot Password`).

---

## **🔹 Как работает процесс сброса пароля?**

**1️⃣ (Forgot Password)** Пользователь вводит email и отправляет запрос.  
**2️⃣ Система генерирует токен** и отправляет ссылку на email.  
**3️⃣ (Reset Password)** Пользователь переходит по ссылке, вводит новый пароль и отправляет его с токеном.  
**4️⃣ Пароль обновляется в базе данных.**

---

## **🔹 Почему нельзя просто вызвать `ResetPasswordAsync()` без токена?**

- `ResetPasswordAsync(user, token, newPassword)` требует токен для безопасности.
- Без него **любой злоумышленник** мог бы изменить пароль любого пользователя.
- Токен подтверждает, что пользователь действительно запросил сброс пароля.

---

## **📌 Вывод**

✔️ **`Reset Password` без `Forgot Password` бессмысленен.**  
✔️ Он **всегда идёт второй частью процесса** и требует токен.  
✔️ `Forgot Password` нужен, чтобы получить токен для `Reset Password`.

Конечно! Разберем подробно процесс **декодирования и валидации токена** при сбросе пароля.

---

### 🔹 1. Получение токена с фронтенда

Когда пользователь отправляет запрос на сброс пароля, он получает **ссылку с токеном**, например:

```
https://example.com/reset-password?token=eyJhbGciOiJIUzI1...
```

Пользователь вводит новый пароль и отправляет этот токен вместе с новым паролем на сервер.

Пример запроса:

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com",
  "newPassword": "NewStrongPassword123!"
}
```

---

### 🔹 2. Декодирование токена

На сервере мы принимаем токен и декодируем его.  
Если используется **JWT (JSON Web Token)**, его структура будет примерно такой:

#### Пример JWT токена:

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user@example.com",
  "exp": 1710000000,
  "jti": "random-unique-id",
  "scope": "password-reset"
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret-key
)
```

Чтобы декодировать токен в C# (используя **Microsoft.IdentityModel.Tokens** и **System.IdentityModel.Tokens.Jwt**):

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

public ClaimsPrincipal? ValidateToken(string token, string secretKey)
{
    var tokenHandler = new JwtSecurityTokenHandler();
    var key = System.Text.Encoding.UTF8.GetBytes(secretKey);

    var validationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false, // Можно добавить проверку
        ValidateAudience = false, // Можно добавить проверку
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };

    try
    {
        var principal = tokenHandler.ValidateToken(token, validationParameters, out var securityToken);
        var jwtToken = (JwtSecurityToken)securityToken;

        if (jwtToken == null || !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.OrdinalIgnoreCase))
            throw new SecurityTokenException("Invalid token");

        return principal; // Если токен валиден — возвращаем его данные
    }
    catch
    {
        return null; // Ошибка валидации токена
    }
}
```

Этот код:

- **Парсит JWT** (разбирает его на части).
- **Проверяет подпись** (подпись создается с секретным ключом и должна совпадать).
- **Проверяет время жизни (`exp`)** (если срок истек — токен недействителен).
- **Возвращает `ClaimsPrincipal`**, содержащий полезные данные.

---

### 🔹 3. Валидация токена

После декодирования проверяем его корректность:

✅ **Проверка срока действия (`exp`)**

- Токен не должен быть просрочен.

✅ **Проверка подписи**

- Она должна совпадать с секретным ключом сервера.

✅ **Проверка email**

- Извлекаем email из `sub` (или другого claim) и сравниваем с email в запросе.

✅ **Проверка уникального ID (`jti`)**

- Если токены хранятся в БД, проверяем, что этот `jti` ещё не использовался.

✅ **Проверка `scope` (если есть)**

- Например, `scope` должен быть `"password-reset"`, чтобы убедиться, что это токен именно для сброса пароля.

---

### 🔹 4. Итог: что делает сервер

1. **Декодирует JWT токен** (извлекает данные).
2. **Проверяет подпись** (убедиться, что токен не подделан).
3. **Проверяет срок действия (`exp`)**.
4. **Сравнивает email из токена с email в запросе**.
5. **Проверяет, не был ли токен уже использован** (если храним его в БД).
6. **Если все ок — обновляет пароль и отправляет ответ пользователю**.

---

### 🔥 Альтернативы JWT

1. **Токены в базе данных**
    
    - Вместо JWT можно хранить случайный **GUID-токен** в БД и проверять его при каждом запросе.
    - Но это требует дополнительных операций с БД.
2. **OTP (одноразовые коды)**
    
    - Можно использовать временные одноразовые коды (например, шестизначные числа).
    - Минус — менее безопасно по сравнению с JWT.

---

### ❓ Вопрос: что делать, если токен не валиден?

- Если токен **просрочен** → вернуть ошибку `400 Bad Request` с пояснением.
- Если **подпись неверная** → вернуть `401 Unauthorized`.
- Если **email в токене не совпадает с запросом** → вернуть `403 Forbidden`.

Пример кода для обработки ошибок:

```csharp
var principal = ValidateToken(request.Token, secretKey);
if (principal == null)
    return BadRequest("Invalid or expired token");

var emailFromToken = principal.FindFirstValue(ClaimTypes.NameIdentifier);
if (emailFromToken != request.Email)
    return Forbid(); // 403 Forbidden
```

---

### ✨ Заключение

Процесс **декодирования и валидации токена** включает:  
✔ Разбор JWT  
✔ Проверку подписи и срока действия  
✔ Сравнение email  
✔ Проверку `jti` (если храним в БД)  
✔ Проверку `scope` (если используем)

Если всё корректно — меняем пароль пользователя. 🔐🚀