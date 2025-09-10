
- **Назначение:** Применяются ко всем действиям контроллера в приложении. Они регистрируются в `Startup.cs` и используются для глобального применения фильтров.
- **Пример использования:**
```c#
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllersWithViews(options =>
    {
        options.Filters.Add(new MyActionFilter());
    });
}
```