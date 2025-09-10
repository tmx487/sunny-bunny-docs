## 🔸Basic Level

Например есть запрос:

```csharp
var adults = db.Users
               .Where(u => u.Age >= 18)
               .OrderBy(u => u.Name)
               .Select(u => new { u.Name, u.Email });
```

### 🔆Что происходит на каждом шаге

>[!warning] Важно
>Пока не будет вызван, например, метод `ToList()` или не будет осуществлен перебор `adults`, **ничего не происходит** — это просто выражение.

### 🟩 `db.Users`

Это `DbSet<User>`, реализующий `IQueryable<User>`.  
На этом этапе у тебя просто «запрос к таблице `Users`», как будто бы `SELECT * FROM Users`.

---

### 🟨 `.Where(u => u.Age >= 18)`

Этот метод **добавляет фильтр** к запросу.

**Что теперь «содержит» выражение:**

> `SELECT * FROM Users WHERE Age >= 18`

Это всё ещё `IQueryable<User>` — ты **не получаешь данные**, а **добавляешь шаг в цепочку**.

---

### 🟧 `.OrderBy(u => u.Name)`

Добавляет сортировку по имени. Теперь выражение говорит:

> `SELECT * FROM Users WHERE Age >= 18 ORDER BY Name`

До сих пор — **всё ленивое выполнение**, запрос ещё не отправлен в БД.

---

### 🟥 `.Select(u => new { u.Name, u.Email })`

Теперь ты **не возвращаешь весь `User`**, а только `Name` и `Email`.

Запрос превращается в:

> `SELECT Name, Email FROM Users WHERE Age >= 18 ORDER BY Name`

---

## 🔹 Итого: что такое `adults`?

Это переменная типа `IQueryable<AnonymousType>`, (где `AnonymousType` — тип с двумя полями: `Name`, `Email`).

---

## 🧠 Почему это важно?

До тех пор, пока ты не сделаешь:

```csharp
var list = adults.ToList(); // или foreach, или First(), или Count()
```

— **запрос в базу не отправляется**, потому что `IQueryable` — это **ленивая цепочка выражений**, которую Entity Framework потом **превратит в SQL** и выполнит.

---

## 🔍 Если распечатать SQL

Если бы ты подключил логирование EF Core, ты бы увидел:

```sql
SELECT [u].[Name], [u].[Email]
FROM [Users] AS [u]
WHERE [u].[Age] >= 18
ORDER BY [u].[Name]
```

## 🔹Advanced Level
### ✅ `SelectMany` — "разворачивание" вложенных коллекций

```csharp
public class Course {
    public string Name { get; set; }
    public List<Student> Students { get; set; }
}

var courses = new List<Course> { ... };

// Получить всех студентов со всех курсов:
var allStudents = courses.SelectMany(c => c.Students);
```

> **`SelectMany` превращает `List<List<T>>` → `List<T>`**

---

### ✅ `GroupJoin` — объединение с группировкой

Пример: преподаватели и их студенты

```csharp
var teachers = new[] {
    new { Id = 1, Name = "John" },
    new { Id = 2, Name = "Alice" }
};

var students = new[] {
    new { Name = "Bob", TeacherId = 1 },
    new { Name = "Kate", TeacherId = 2 },
    new { Name = "Tom", TeacherId = 1 }
};

var result = teachers.GroupJoin(
    students,
    t => t.Id,
    s => s.TeacherId,
    (t, studentGroup) => new {
        Teacher = t.Name,
        Students = studentGroup.Select(s => s.Name)
    });

```

---

### ✅ `Aggregate` — аккумулирование значений вручную

```csharp
var numbers = new[] { 1, 2, 3, 4 };

// сумма
var sum = numbers.Aggregate((acc, next) => acc + next); // = 10

// создание строки
var sentence = words.Aggregate((acc, word) => acc + " " + word);
```