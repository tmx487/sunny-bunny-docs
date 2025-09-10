---
уровень: "[[junior]]"
секция: платформа .NET
пройдено: 
теги: 
дата: 02-05-2024
время: 19:32
---
[docs#1](#https://learn.microsoft.com/en-us/aspnet/mvc/overview/older-versions-1/controllers-and-routing/understanding-action-filters-cs)
[docs#2-rus](#https://learn.microsoft.com/ru-ru/aspnet/core/mvc/controllers/filters?view=aspnetcore-8.0)

В ASP.NET Core существует целых пять типов фильтров[^1]:

1. Фильтры авторизации ([[Authorization Filter]])
2. Фильтры ресурсов ([[Resource Filters]])
3. Фильтры действий ([[Action Filter]])
4. Фильтры результатов ([[Result Filter]])
5. Фильтры исключений ([[Exception Filter]])

[^1]: Помимо указанных есть еще [[Global Filters]], [[Type Filters]], [[Service Filters]] 

![[action-filters.png|300]] 

**Action-фильтры** вызываются после фильтров ресурсов и служат для выполнения определенных действий до и после выполнения определенных методов в контроллерах

```c#
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

public class LogActionFilter : IActionFilter
{
	private readonly ILogger<LogActionFilter> _logger;
	
	public LogActionFilter(ILogger<LogActionFilter> logger)
	{
		 _logger = logger; 
	}
	
	public void OnActionExecuting(ActionExecutingContext context)
	{
		//  Этот метод выполняется до метода контроллера
		_logger.LogInformation($"Action '{context.ActionDescriptor.DisplayName}' is starting.");
	}
	
	public void OnActionExecuted(ActionExecutedContext context)
	{ 
		// Этот метод выполняется после метода контроллера
		_logger.LogInformation($"Action '{context.ActionDescriptor.DisplayName}' has completed.");
	}
}

// Метод ConfigureServices
services.AddMvc(options =>
{
	options.Filters.Add<LogActionFilter>();
});

// SomeController
[ServiceFilter(typeof(LogActionFilter))] // Применяем фильтр к данному методу контроллераpublic IActionResult MyAction()
{
	// Логика нашего метода контроллера
}
```

> Теперь при каждом вызове метода `MyAction` фильтр `LogActionFilter` будет регистрировать начало и конец действия, представляя собой простой способ контроля за выполнением методов контроллера.