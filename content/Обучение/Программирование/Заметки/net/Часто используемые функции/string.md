### **IsNullOrEmpty()**

Метод `string.IsNullOrEmpty()` в C# используется для **проверки, пуста ли строка или равна ли она `null`**.

---

## 📌 Сигнатура:

```csharp
public static bool IsNullOrEmpty(string value);
```

## ✅ Что делает:

Возвращает `true`, если:

- строка равна `null`
    
- строка — пустая (`""`, длина = 0)
    

Иначе — возвращает `false`.

---

## 🧪 Примеры:

```csharp
string s1 = null;
string s2 = "";
string s3 = "hello";

Console.WriteLine(string.IsNullOrEmpty(s1)); // true
Console.WriteLine(string.IsNullOrEmpty(s2)); // true
Console.WriteLine(string.IsNullOrEmpty(s3)); // false
```

---

## 🧠 Когда полезно:

- Проверка строки перед обработкой (например, чтобы не вызвать `Trim()`, `Length`, `Split()` у `null`)
    
- Простая валидация пользовательского ввода
    
- Вместо длинной конструкции:
    

```csharp
if (value == null || value == "")
```

можно просто:

```csharp
if (string.IsNullOrEmpty(value))
```

---

Если хочешь проверить ещё и строки, которые содержат только пробелы, то для этого есть:

👉 `string.IsNullOrWhiteSpace(value)` — проверяет и `null`, и пустые, и " ".

### **IsNullOrWhiteSpace()**

- Возвращает `true`, если строка равна `null`, пуста или состоит только из пробельных символов (пробел, табуляция, новая строка и т. д.).
    
- Например, `" "` (строка с одним пробелом) вернёт `true`.