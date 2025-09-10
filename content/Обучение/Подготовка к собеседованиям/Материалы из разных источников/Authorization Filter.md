- **Назначение:** Обрабатывают логику авторизации до выполнения действия. **Если пользователь не авторизован, выполнение действия не происходи**т.
- **Примеры:** `AuthorizeAttribute`
- **Пример использования:**
```c#
public class MyAuthorizationFilter : IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Логика авторизации
    }
}
```