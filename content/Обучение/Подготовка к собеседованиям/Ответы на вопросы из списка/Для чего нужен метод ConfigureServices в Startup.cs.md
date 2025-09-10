---
уровень: "[[middle]]"
секция: платформа .NET
пройдено: 
теги: 
дата: 02-05-2024
время: 20:27
---

Метод `ConfigureServices` в `Startup.cs` используется для регистрации служб в контейнере внедрения зависимостей (Dependency Injection container) в приложении ASP.NET Core. Этот метод позволяет настроить все зависимости, которые понадобятся приложению для корректной работы, включая сервисы, middleware, опции конфигурации, базы данных и прочее.

### Основные задачи `ConfigureServices`:

1. **Регистрация служб:**
   - В методе `ConfigureServices` вы регистрируете различные службы (сервисы), которые будут использоваться в приложении. Эти службы затем могут быть внедрены в контроллеры, middleware и другие части приложения через механизм Dependency Injection (DI).

2. **Конфигурация опций:**
   - Метод позволяет настроить различные опции конфигурации, такие как параметры соединения с базой данных, настройки кэширования, параметры аутентификации и авторизации и другие.

3. **Настройка middleware:**
   - Хотя основная конфигурация middleware происходит в методе `Configure`, в `ConfigureServices` также можно зарегистрировать необходимые middleware и сервисы, которые они используют.

### Пример использования:

Рассмотрим простой пример `Startup.cs`, чтобы лучше понять, как используется метод `ConfigureServices`.

```csharp
public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
        // Регистрация контроллеров
        services.AddControllers();
        
        // Регистрация службы для работы с базой данных (например, EF Core)
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));
        
        // Регистрация службы аутентификации
        services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();
        
        // Регистрация пользовательской службы
        services.AddTransient<IMyService, MyService>();
        
        // Настройка опций
        services.Configure<MyOptions>(Configuration.GetSection("MyOptions"));
        
        // Регистрация других необходимых служб
        services.AddMemoryCache();
        services.AddDistributedRedisCache(options =>
        {
            options.Configuration = Configuration.GetConnectionString("Redis");
        });
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseExceptionHandler("/Home/Error");
            app.UseHsts();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        
        app.UseRouting();
        
        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");
        });
    }
}
```

### Разбор кода:

1. **Регистрация контроллеров:**
   - `services.AddControllers();` - добавляет поддержку контроллеров в приложение.

2. **Регистрация DbContext:**
   - `services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));` - регистрирует контекст базы данных и настраивает его для использования SQL Server.

3. **Регистрация службы аутентификации:**
   - `services.AddIdentity<ApplicationUser, IdentityRole>()` - добавляет и настраивает службы Identity для аутентификации и авторизации.

4. **Регистрация пользовательских служб:**
   - `services.AddTransient<IMyService, MyService>();` - регистрирует пользовательскую службу с транзитной (transient) областью видимости.

5. **Настройка опций:**
   - `services.Configure<MyOptions>(Configuration.GetSection("MyOptions"));` - связывает конфигурационные параметры из секции "MyOptions" с типом `MyOptions`.

6. **Регистрация служб кэширования:**
   - `services.AddMemoryCache();` - добавляет поддержку in-memory кэширования.
   - `services.AddDistributedRedisCache(options => { options.Configuration = Configuration.GetConnectionString("Redis"); });` - добавляет поддержку распределенного кэширования с использованием Redis.

### Вывод:

Метод `ConfigureServices` в `Startup.cs` необходим для регистрации и конфигурации всех служб, которые будут использоваться в приложении. Он играет ключевую роль в настройке DI-контейнера, который управляет жизненным циклом и зависимостями всех компонентов в приложении ASP.NET Core.