### ✅ 1. **Создай пустой Solution**

Открой терминал в Cursor (или внешний, если удобно):

```bash
dotnet new sln -n MySolution
```

> Замените `MySolution` на желаемое имя.

Это создаст файл `MySolution.sln`.

---

### ✅ 2. **Создай папку и проект внутри**

Например, создадим папку `MyApp.Api` с проектом:

```bash
mkdir MyApp.Api
cd MyApp.Api
dotnet new webapi -n MyApp.Api
```

Затем вернись в корень, где `MySolution.sln`, и добавь проект в solution:

```bash
cd ..
dotnet sln add MyApp.Api/MyApp.Api.csproj
```

#### 〽️ Как посмотреть список доступных шаблонов

В терминале выполни:

```bash
dotnet new list
```

Ты увидишь таблицу с шаблонами, например:

|Шаблон|Краткое имя|Язык|
|---|---|---|
|Консольное приложение|console|C#|
|Класс-библиотека|classlib|C#|
|Web API|webapi|C#|
|ASP.NET Core Web App (MVC)|mvc|C#|
|ASP.NET Core Web App (Razor Pages)|webapp|C#|
|Библиотека Razor Class|razorclasslib|C#|
|Тесты xUnit|xunit|C#|
|Тесты NUnit|nunit|C#|
|Worker service (фоновый сервис)|worker|C#|
|gRPC сервис|grpc|C#|
|Blazor WebAssembly App|blazorwasm|C#|
|Blazor Server App|blazorserver|C#|

---

#### 〽️ Как создать проект по шаблону

Формат команды:

```bash
dotnet new <краткое_имя> -n <ИмяПроекта>
```

Примеры:

```bash
dotnet new console -n MyConsoleApp
dotnet new webapi -n MyWebApi
dotnet new classlib -n MyLibrary
dotnet new xunit -n MyTests
dotnet new mvc -n MyMvcApp
```

---

### ✅ 3. **Добавляй другие проекты по аналогии**

Например, библиотеку:

```bash
mkdir MyApp.Core
cd MyApp.Core
dotnet new classlib -n MyApp.Core
cd ..
dotnet sln add MyApp.Core/MyApp.Core.csproj
```

---

### ✅ 4. **Запуск нужного проекта**

Для запуска конкретного проекта:

```bash
dotnet run --project MyApp.Api/MyApp.Api.csproj
```

---

### ✅ 5. **Открытие всего решения в Cursor**

В Cursor открой корень, где лежит `.sln` файл. В дереве ты увидишь папки и проекты.

---

### 💡 Рекомендации

- Используй `dotnet build` для сборки всего решения.
    
- Используй `dotnet test` для запуска всех тестов.
    
- Для удобства настрой `launch.json` (если Cursor поддерживает отладку как VS Code).

### ✅ 6. Конфигурация `.vscode/launch.json`

#### 📄 `.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Запуск MyApp.Api",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/MyApp.Api/bin/Debug/net8.0/MyApp.Api.dll",
      "args": [],
      "cwd": "${workspaceFolder}/MyApp.Api",
      "stopAtEntry": false,
      "console": "internalConsole"
    }
  ]
}
```

---

#### 📌 Объяснение параметров

|Поле|Описание|
|---|---|
|`name`|Название конфигурации (можно выбрать в интерфейсе запуска).|
|`type`|Для .NET Core всегда `coreclr`.|
|`request`|Тип действия — запуск (`launch`).|
|`preLaunchTask`|Перед запуском выполняется сборка (можно отключить).|
|`program`|Путь к скомпилированному `.dll` — важно указать правильный `netX.Y`.|
|`cwd`|Рабочая директория (корень проекта).|
|`console`|Где будет показываться вывод (можно выбрать `integratedTerminal` для обычного терминала).|

---

#### ✅ Как использовать

1. Создай `.vscode/` в корне проекта.
    
2. Помести туда этот `launch.json`.
    
3. В Cursor нажми `F5` или выбери нужную конфигурацию и запусти.
    

---

Если у тебя используется, например, `net7.0` или `net6.0`, просто поменяй путь в `"program"`.