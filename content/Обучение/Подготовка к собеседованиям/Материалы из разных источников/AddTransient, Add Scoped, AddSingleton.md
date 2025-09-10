🔗[Service lifetimes](#https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection#service-lifetimes)

The below three methods define the lifetime of the services,

1. _AddTransient_  
    Transient lifetime services are created each time they are requested. This lifetime works best for lightweight, stateless services.  
     
2. _AddScoped_  
    Scoped lifetime services are created once per request.  
     
3. _AddSingleton_  
    Singleton lifetime services are created the first time they are requested (or when ConfigureServices is run if you specify an instance there) and then every subsequent request will use the same instance.


Используя различные методы внедрения зависимостей, можно управлять жизненным циклом создаваемых сервисов. Сервисы, которые создаются механизмом [[Что такое dependency injection и зачем оно нужно|Depedency Injection]], могут представлять один из следующих типов:

- **Transient**: при каждом обращении к сервису создается новый объект сервиса. В течение одного запроса может быть несколько обращений к сервису, соответственно при каждом обращении будет создаваться новый объект. Подобная модель жизненного цикла наиболее подходит для легковесных сервисов, которые не хранят данных о состоянии
    
- **Scoped**: для каждого запроса создается свой объект сервиса. То есть если в течение одного запроса есть несколько обращений к одному сервису, то при всех этих обращениях будет использоваться один и тот же объект сервиса.
    
- **Singleton**: объект сервиса создается при первом обращении к нему, все последующие запросы используют один и тот же ранее созданный объект сервиса