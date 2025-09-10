Нет, если пользователь просто хочет **изменить пароль**, зная свой текущий пароль, то это **изменение пароля ("Change Password")**, а не сброс.

Для этого есть отдельный метод в **`UserManager`** — `ChangePasswordAsync()`.

---

## **📌 Варианты работы с паролем**

|Сценарий|Когда используется?|Требует текущий пароль?|Используемый метод|
|---|---|---|---|
|**"Forgot Password" (Забыл пароль)**|Если пользователь **забыл пароль** и не может войти|❌ Нет|`GeneratePasswordResetTokenAsync()` + `ResetPasswordAsync()`|
|**"Reset Password" (Сброс пароля)**|Когда пользователь **получил ссылку** для сброса пароля|❌ Нет|`ResetPasswordAsync()`|
|**"Change Password" (Смена пароля)**|Когда пользователь **знает текущий пароль** и хочет его поменять|✅ Да|`ChangePasswordAsync()`|

---

## **🔹 Реализация изменения пароля**

**Контроллер:**

```csharp
[HttpPost("change-password")]
public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest model)
{
    var user = await _userManager.FindByIdAsync(User.FindFirstValue(ClaimTypes.NameIdentifier));
    if (user == null)
    {
        return Unauthorized("User not found.");
    }

    var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

    if (!result.Succeeded)
    {
        return BadRequest(result.Errors);
    }

    return Ok("Password changed successfully.");
}
```

**Модель запроса:**

```csharp
public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; }
    public string NewPassword { get; set; }
}
```

---

## **📌 Разница между `ResetPasswordAsync()` и `ChangePasswordAsync()`**

|Метод|Когда используется?|Требует старый пароль?|
|---|---|---|
|`ResetPasswordAsync(user, token, newPassword)`|Для сброса пароля через email|❌ Нет|
|`ChangePasswordAsync(user, currentPassword, newPassword)`|Для смены пароля внутри аккаунта|✅ Да|

---

🚀 **Вывод:**

- **Если пользователь забыл пароль** → `Reset Password`
- **Если пользователь просто хочет изменить пароль в профиле** → `Change Password`

Поэтому **нужен отдельный эндпоинт** `POST api/auth/change-password`.