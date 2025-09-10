Оператор `nameof` в C# возвращает **строковое имя** символа (переменной, метода, свойства, класса и т. д.), **без вычисления его значения**. Это удобно для логирования, выброса исключений и других случаев, где нужно указать имя члена в виде строки, но при этом избежать "магических строк" (magic strings), которые ломаются при переименовании.

---

### 🔧 Пример использования:

```csharp
string name = "Anna";
Console.WriteLine(nameof(name)); // Выведет "name"
```

```csharp
void Print(int number)
{
    if (number < 0)
        throw new ArgumentException("Number cannot be negative", nameof(number));
}
```

В примере выше `nameof(number)` вернёт `"number"` — имя параметра. Это удобно, потому что если вы переименуете параметр `number`, компилятор автоматически обновит строку, и не будет рассинхронизации.

---

### ✅ Преимущества:

- **Безопасность при рефакторинге** — если вы переименуете переменную, `nameof()` обновится автоматически.
    
- **Легче поддерживать** и читать код.
    
- **Полезно в логировании, сообщениях об ошибках, валидации и тестах.**
    

---

### 📚 Документация от Microsoft:

👉 [https://learn.microsoft.com/dotnet/csharp/language-reference/operators/nameof](https://learn.microsoft.com/dotnet/csharp/language-reference/operators/nameof)