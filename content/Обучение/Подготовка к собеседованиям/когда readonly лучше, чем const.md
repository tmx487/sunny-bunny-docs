```csharp
public static class Config
{
    public const string ApiUrl = "https://old-api.com"; // ❌ Опасно, если API поменяется!
}

public static class Config
{
    public static readonly string ApiUrl = GetApiUrl(); // ✅ Можно менять без перекомпиляции зависимых сборок.

    private static string GetApiUrl()
    {
        return "https://new-api.com";
    }
}
```

**Если `const ApiUrl` изменится, все проекты, использующие старую сборку, не узнают об изменении!**  
С `readonly` такой проблемы нет. 🚀