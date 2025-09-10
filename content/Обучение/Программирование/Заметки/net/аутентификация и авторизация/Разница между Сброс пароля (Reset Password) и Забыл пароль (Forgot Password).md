Эти термины часто используются как синонимы, но между ними есть небольшое различие в контексте взаимодействия с пользователем и системой.

---

## **1️⃣ Забыл пароль (Forgot Password) — Запрос на сброс пароля**

🔹 Это **первая часть процесса**, когда пользователь осознает, что не помнит пароль и инициирует его восстановление.

### **Процесс:**

1. Пользователь нажимает "Забыли пароль?"
2. Вводит свой email
3. Сервер проверяет, существует ли email в системе
4. Если email найден, сервер отправляет пользователю **письмо со ссылкой на сброс пароля**
5. В письме есть уникальный токен, который действует ограниченное время

📌 **Ключевой момент:** Здесь **пароль еще не меняется**, а только отправляется письмо со ссылкой.

---

## **2️⃣ Сброс пароля (Reset Password) — Установка нового пароля**

🔹 Это **вторая часть процесса**, когда пользователь уже получил письмо и теперь вводит новый пароль.

### **Процесс:**

1. Пользователь переходит по ссылке из письма
2. Вводит новый пароль
3. Сервер проверяет валидность токена
4. Если токен действителен, сервер **обновляет пароль в базе данных**
5. Пользователь получает уведомление, что пароль изменен
6. Опционально: Система может разлогинить пользователя на всех устройствах

📌 **Ключевой момент:** Здесь **пароль уже меняется** и сохраняется в базе.

---

## **📌 Основное различие**

|Сценарий|Что делает пользователь?|Что делает сервер?|Когда это происходит?|
|---|---|---|---|
|**Забыл пароль (Forgot Password)**|Вводит email и отправляет запрос|Отправляет письмо со ссылкой|В начале процесса|
|**Сброс пароля (Reset Password)**|Вводит новый пароль|Проверяет токен и обновляет пароль в БД|После перехода по ссылке|

---

## **📌 Итог**

- **"Забыл пароль"** — это запрос на сброс пароля
- **"Сброс пароля"** — это процесс изменения пароля после перехода по ссылке

🚀 **Оба сценария являются частями одного процесса!**

## **А что в контроллере**

В контроллере **должно быть два эндпоинта**, так как это два разных шага процесса:

**1️⃣Запрос сброса пароля ("Forgot Password")**  
**2️⃣Фактический сброс пароля ("Reset Password")**

---

### **🔹 Контроллер с двумя эндпоинтами**

```csharp
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailSender _emailSender;

    public AuthController(UserManager<ApplicationUser> userManager, IEmailSender emailSender)
    {
        _userManager = userManager;
        _emailSender = emailSender;
    }

    /// <summary>
    /// 1️⃣ Отправка ссылки на сброс пароля (Forgot Password)
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            return BadRequest("User not found.");
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var resetLink = $"{Request.Scheme}://{Request.Host}/reset-password?email={model.Email}&token={WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token))}";

        await _emailSender.SendEmailAsync(user.Email, "Reset Password", $"Click <a href='{resetLink}'>here</a> to reset your password.");

        return Ok("Password reset email has been sent.");
    }

    /// <summary>
    /// 2️⃣ Сброс пароля (Reset Password)
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
        {
            return BadRequest("User not found.");
        }

        var token = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(model.Token));
        var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        return Ok("Password has been successfully reset.");
    }
}
```

---

### **🔹 Модели запросов**

```csharp
public class ForgotPasswordRequest
{
    public string Email { get; set; }
}

public class ResetPasswordRequest
{
    public string Email { get; set; }
    public string Token { get; set; }
    public string NewPassword { get; set; }
}
```

---

### **🔹 Как работает процесс?**

**1️⃣ Пользователь запрашивает сброс пароля** (`POST api/auth/forgot-password`)

- Генерируется токен
- Формируется ссылка на сброс пароля
- Отправляется письмо со ссылкой

**2️⃣ Пользователь вводит новый пароль** (`POST api/auth/reset-password`)

- Валидация токена
- Смена пароля
- Подтверждение успешного сброса

🚀 **Теперь процесс сброса пароля полностью работает!**
