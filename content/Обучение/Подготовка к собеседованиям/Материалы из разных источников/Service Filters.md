
- **Назначение:** Позволяют использовать зарегистрированные в DI-контейнере фильтры.
- **Пример использования:**
```c#
[ServiceFilter(typeof(MyActionFilter))]
public class MyController : Controller
{
    // ...
}
```