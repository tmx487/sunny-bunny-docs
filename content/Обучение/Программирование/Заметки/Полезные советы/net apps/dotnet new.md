### 1. Создание проекта через терминал

Если тебе нужен **консольный проект**, но с возможностью использовать ASP.NET Core, проще всего создать обычное **консольное приложение** и добавить в него нужные пакеты.

Открываешь терминал в **Cursor** и выполняешь команду:

```sh
dotnet new console -n MyConsoleApp

dotnet new console -n MyConsoleApp --use-program-main // если не нужны высокоуровневые объявления
```

🔹 `MyConsoleApp` — название проекта.

Далее заходишь в папку проекта:

```sh
cd MyConsoleApp
```

### 2. Добавление необходимых пакетов

Если тебе нужны ASP.NET Core зависимости, например, **веб-сервер, логирование, DI**, добавляешь их:

```bash
dotnet add package Microsoft.AspNetCore
dotnet add package Microsoft.Extensions.Hosting
dotnet add package Microsoft.Extensions.DependencyInjection
```

### 3. Настройка `Program.cs`

Теперь можно настроить `Program.cs`, например, запустить **минимальный веб-сервер** внутри консоли:

```csharp
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var host = Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.Configure(app =>
                {
                    app.Run(async context =>
                    {
                        await context.Response.WriteAsync("Hello from Console ASP.NET Core App!");
                    });
                });
            })
            .Build();

        Console.WriteLine("Server is running... Press Ctrl+C to exit.");
        await host.RunAsync();
    }
}
```

### 4. Запуск проекта

Запускаешь приложение командой:

```sh
dotnet run
```

После запуска сервер будет доступен по адресу: **[http://localhost:5000/](http://localhost:5000/)**.

Если у вас несколько методов `Main()` в проекте, вы можете указать, какой именно метод запустить, используя параметр `--project` и указав конкретный файл с методом `Main()`. Вот как это сделать:

1. Если методы `Main()` находятся в разных файлах, вы можете указать конкретный файл:

```
dotnet run --project TestingTheoreticalExamples.csproj -- <путь_к_файлу>
```

Например, если у вас есть метод `Main()` в файле `StaticFields/Program.cs`, вы можете запустить его так:

```
dotnet run --project TestingTheoreticalExamples.csproj -- StaticFields/Program.cs
```

2. Если методы `Main()` находятся в одном файле, но имеют разные имена (например, `Main1()`, `Main2()`), вы можете изменить код, чтобы выбрать нужный метод:

```csharp
// В файле Program.cs
public class Program
{
    public static void Main(string[] args)
    {
        // Проверяем аргументы командной строки
        if (args.Length > 0 && args[0] == "static")
        {
            StaticFields.Program.Main(args);
        }
        else if (args.Length > 0 && args[0] == "delegates")
        {
            Delegates.Program.Main(args);
        }
        else
        {
            // По умолчанию запускаем основной метод
            Console.WriteLine("Выберите метод для запуска: static, delegates");
        }
    }
}
```

Затем вы можете запустить конкретный метод:

```
dotnet run -- static
```

или

```
dotnet run -- delegates
```

3. Альтернативный подход - создать отдельные проекты для каждого метода `Main()` и запускать их по отдельности:

```
dotnet run --project StaticFields/StaticFields.csproj
```

или

```
dotnet run --project Delegates/Delegates.csproj
```

4. Если вы хотите запустить конкретный класс с методом `Main()`, вы можете использовать параметр `--launch-profile`:

```
dotnet run --launch-profile StaticFields
```

Для этого вам нужно настроить профили запуска в файле `launchSettings.json` в папке `.vscode` или `Properties`.

Выберите подход, который лучше всего подходит для вашего проекта.

### Альтернативный вариант: Создание **Worker Service**

Если тебе нужно **фоновое приложение** с ASP.NET Core, можно использовать шаблон `worker`:

```sh
dotnet new worker -n MyWorkerApp
```

Этот шаблон уже включает ASP.NET Core `HostBuilder`, но без контроллеров.