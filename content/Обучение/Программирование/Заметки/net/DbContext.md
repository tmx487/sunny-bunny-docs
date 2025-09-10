>A `DbContext` instance is designed to be used for a _single_ [unit-of-work](https://www.martinfowler.com/eaaCatalog/unitOfWork.html).

A typical unit-of-work when using Entity Framework Core (EF Core) involves:

- Creation of a `DbContext` instance
- Tracking of entity instances by the context. Entities become tracked by
    - Being [returned from a query](https://learn.microsoft.com/en-us/ef/core/querying/tracking)
    - Being [added or attached to the context](https://learn.microsoft.com/en-us/ef/core/saving/disconnected-entities)
- Changes are made to the tracked entities as needed to implement the business rule
- [SaveChanges](https://learn.microsoft.com/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext.savechanges) or [SaveChangesAsync](https://learn.microsoft.com/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext.savechangesasync) is called. EF Core detects the changes made and writes them to the database.
- The `DbContext` instance is disposed

- [DbContext is **Not thread-safe**](https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/#avoiding-dbcontext-threading-issues). Don't share contexts between threads. Make sure to [await](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/await) all async calls before continuing to use the context instance.

- An [InvalidOperationException](https://learn.microsoft.com/en-us/dotnet/api/system.invalidoperationexception) thrown by EF Core code can put the context into an unrecoverable state. Such exceptions indicate a program error and are not designed to be recovered from.

- The service provider is also known as the dependency injection container (in ASP.NET Core it is the ASP.NET Core app service provider).


- 

