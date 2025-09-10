# Алгоритм сборки мусора (Garbage Collection) в C#

Сборка мусора в C# — это автоматический механизм управления памятью, который освобождает память, занятую неиспользуемыми объектами. Вот как это работает:

## Основные шаги сборки мусора

### 1. Выделение памяти

Когда вы создаете объект в C#, CLR (Common Language Runtime) выделяет память в управляемой куче.

```csharp
class Program
{
    static void Main()
    {
        // Создание объекта - память выделяется в куче
        Person person = new Person("Иван", 30);
    }
}

class Person
{
    public string Name { get; set; }
    public int Age { get; set; }
    
    public Person(string name, int age)
    {
        Name = name;
        Age = age;
    }
}
```

### 2. Определение корней

GC (сборщик мусора) начинает с "корней" — ссылок, которые непосредственно доступны из кода:

- Локальные переменные в стеке
- Статические поля
- Регистры процессора
- Финализируемые объекты, ожидающие финализации

### 3. Построение графа объектов

GC строит граф достижимости, начиная с корней и рекурсивно обходя все ссылки.

<pre>
```svg
<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Фон -->
  <rect width="600" height="400" fill="#f8f9fa" />
  
  <!-- Заголовок -->
  <text x="300" y="30" font-family="Arial" font-size="18" text-anchor="middle" font-weight="bold">Сборка мусора в C#: Граф достижимости</text>
  
  <!-- Легенда -->
  <rect x="450" y="60" width="20" height="20" fill="#a8d08d" stroke="#000" />
  <text x="480" y="75" font-family="Arial" font-size="12">Достижимые объекты</text>
  
  <rect x="450" y="90" width="20" height="20" fill="#f4b084" stroke="#000" />
  <text x="480" y="105" font-family="Arial" font-size="12">Недостижимые объекты</text>
  
  <!-- Корни (Stack & Static) -->
  <rect x="50" y="70" width="120" height="60" fill="#d9e1f2" stroke="#000" />
  <text x="110" y="100" font-family="Arial" font-size="14" text-anchor="middle">Корни</text>
  <text x="110" y="120" font-family="Arial" font-size="12" text-anchor="middle">(стек, статические поля)</text>
  
  <!-- Достижимые объекты -->
  <rect x="250" y="70" width="100" height="60" fill="#a8d08d" stroke="#000" />
  <text x="300" y="105" font-family="Arial" font-size="14" text-anchor="middle">Объект A</text>
  
  <rect x="250" y="170" width="100" height="60" fill="#a8d08d" stroke="#000" />
  <text x="300" y="205" font-family="Arial" font-size="14" text-anchor="middle">Объект B</text>
  
  <rect x="250" y="270" width="100" height="60" fill="#a8d08d" stroke="#000" />
  <text x="300" y="305" font-family="Arial" font-size="14" text-anchor="middle">Объект C</text>
  
  <!-- Недостижимые объекты -->
  <rect x="450" y="170" width="100" height="60" fill="#f4b084" stroke="#000" />
  <text x="500" y="205" font-family="Arial" font-size="14" text-anchor="middle">Объект D</text>
  
  <rect x="450" y="270" width="100" height="60" fill="#f4b084" stroke="#000" />
  <text x="500" y="305" font-family="Arial" font-size="14" text-anchor="middle">Объект E</text>
  
  <!-- Стрелки для связей -->
  <!-- От корней к A -->
  <line x1="170" y1="100" x2="250" y2="100" stroke="#000" stroke-width="2" />
  <polygon points="245,95 250,100 245,105" fill="#000" />
  
  <!-- От A к B -->
  <line x1="300" y1="130" x2="300" y2="170" stroke="#000" stroke-width="2" />
  <polygon points="295,165 300,170 305,165" fill="#000" />
  
  <!-- От B к C -->
  <line x1="300" y1="230" x2="300" y2="270" stroke="#000" stroke-width="2" />
  <polygon points="295,265 300,270 305,265" fill="#000" />
  
  <!-- От D к E -->
  <line x1="500" y1="230" x2="500" y2="270" stroke="#000" stroke-width="2" />
  <polygon points="495,265 500,270 505,265" fill="#000" />
  
  <!-- Штриховая линия между недостижимыми объектами -->
  <line x1="350" y1="200" x2="450" y2="200" stroke="#000" stroke-width="2" stroke-dasharray="5,5" />
  <text x="400" y="185" font-family="Arial" font-size="12" text-anchor="middle">Потеряна ссылка</text>
  
  <!-- Заметка о недостижимых объектах -->
  <text x="500" y="350" font-family="Arial" font-size="14" text-anchor="middle" font-style="italic">Будут собраны</text>
  <text x="500" y="370" font-family="Arial" font-size="14" text-anchor="middle" font-style="italic">сборщиком мусора</text>
</svg>
```
</pre>

### 4. Маркировка объектов

GC помечает все объекты, достижимые из корней, как "живые". Остальные считаются "мусором".

### 5. Поколения объектов

CLR делит кучу на три поколения:

- **Поколение 0** - новые объекты
- **Поколение 1** - объекты, пережившие одну сборку мусора
- **Поколение 2** - объекты, пережившие несколько сборок мусора

<pre>```svg
<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Фон -->
  <rect width="600" height="400" fill="#f8f9fa" />
  
  <!-- Заголовок -->
  <text x="300" y="30" font-family="Arial" font-size="18" text-anchor="middle" font-weight="bold">Поколения объектов в сборке мусора</text>
  
  <!-- Основная область кучи -->
  <rect x="50" y="70" width="500" height="300" fill="#d9e1f2" stroke="#000" stroke-width="2" />
  <text x="300" y="90" font-family="Arial" font-size="16" text-anchor="middle" font-weight="bold">Управляемая куча (Managed Heap)</text>
  
  <!-- Поколение 2 -->
  <rect x="70" y="110" width="460" height="170" fill="#bdd7ee" stroke="#000" stroke-width="2" />
  <text x="100" y="130" font-family="Arial" font-size="14" font-weight="bold">Поколение 2</text>
  <text x="300" y="150" font-family="Arial" font-size="12" text-anchor="middle">Долгоживущие объекты, пережившие несколько сборок</text>
  <text x="300" y="170" font-family="Arial" font-size="12" text-anchor="middle">Сборка происходит реже</text>
  
  <rect x="120" y="190" width="80" height="60" fill="#a8d08d" stroke="#000" />
  <text x="160" y="225" font-family="Arial" font-size="12" text-anchor="middle">Старый</text>
  <text x="160" y="240" font-family="Arial" font-size="12" text-anchor="middle">объект</text>
  
  <rect x="240" y="190" width="80" height="60" fill="#a8d08d" stroke="#000" />
  <text x="280" y="225" font-family="Arial" font-size="12" text-anchor="middle">Старый</text>
  <text x="280" y="240" font-family="Arial" font-size="12" text-anchor="middle">объект</text>
  
  <rect x="360" y="190" width="80" height="60" fill="#a8d08d" stroke="#000" />
  <text x="400" y="225" font-family="Arial" font-size="12" text-anchor="middle">Старый</text>
  <text x="400" y="240" font-family="Arial" font-size="12" text-anchor="middle">объект</text>
  
  <!-- Поколение 1 -->
  <rect x="70" y="290" width="460" height="70" fill="#c6e0b4" stroke="#000" stroke-width="2" />
  <text x="100" y="310" font-family="Arial" font-size="14" font-weight="bold">Поколение 1</text>
  <text x="300" y="310" font-family="Arial" font-size="12" text-anchor="middle">Объекты, пережившие одну сборку</text>
  
  <rect x="170" y="325" width="60" height="25" fill="#a8d08d" stroke="#000" />
  <text x="200" y="342" font-family="Arial" font-size="10" text-anchor="middle">Объект</text>
  
  <rect x="240" y="325" width="60" height="25" fill="#a8d08d" stroke="#000" />
  <text x="270" y="342" font-family="Arial" font-size="10" text-anchor="middle">Объект</text>
  
  <rect x="310" y="325" width="60" height="25" fill="#a8d08d" stroke="#000" />
  <text x="340" y="342" font-family="Arial" font-size="10" text-anchor="middle">Объект</text>
  
  <!-- Поколение 0 -->
  <rect x="70" y="370" width="460" height="30" fill="#ffe699" stroke="#000" stroke-width="2" />
  <text x="100" y="390" font-family="Arial" font-size="14" font-weight="bold">Поколение 0</text>
  <text x="300" y="390" font-family="Arial" font-size="12" text-anchor="middle">Новые объекты</text>
  
  <!-- Стрелка -->
  <line x1="530" y1="280" x2="530" y2="380" stroke="#000" stroke-width="1.5" />
  <polygon points="525,375 530,380 535,375" fill="#000" />
  <text x="550" y="330" font-family="Arial" font-size="12" text-anchor="middle" font-style="italic">Продвижение</text>
  <text x="550" y="345" font-family="Arial" font-size="12" text-anchor="middle" font-style="italic">объектов</text>
</svg>

```</pre>

### 6. Сжатие памяти

После удаления недостижимых объектов GC сжимает память, переместив оставшиеся объекты для устранения фрагментации.

### 7. Финализация объектов

Перед освобождением памяти GC вызывает метод финализации (`Finalize()`) для объектов, которые его переопределяют.

```csharp
class ResourceHolder
{
    private IntPtr nativeResource;
    
    public ResourceHolder()
    {
        // Выделение неуправляемого ресурса
        nativeResource = AllocateResource();
    }
    
    ~ResourceHolder() // Финализатор
    {
        // Освобождение неуправляемого ресурса
        if (nativeResource != IntPtr.Zero)
        {
            FreeResource(nativeResource);
            nativeResource = IntPtr.Zero;
        }
    }
    
    private IntPtr AllocateResource()
    {
        // Код выделения ресурса
        return new IntPtr(1);
    }
    
    private void FreeResource(IntPtr resource)
    {
        // Код освобождения ресурса
    }
}
```

## Подробности реализации

### Алгоритм Mark-and-Sweep

C# использует алгоритм "Mark-and-Sweep" (Маркировка и Удаление):

1. **Маркировка**: Проход по графу объектов с отметкой достижимых
2. **Удаление**: Освобождение памяти недостижимых объектов
3. **Сжатие**: Перемещение объектов для устранения фрагментации

### Оптимизации сборки мусора

1. **Поколенческая сборка**: Частая проверка только новых объектов (поколение 0)
2. **Параллельная сборка**: Использование нескольких потоков для ускорения процесса
3. **Фоновая сборка**: Работа GC в фоновом потоке без блокировки основного приложения

## Примеры работы с памятью

### Правильное управление ресурсами (паттерн IDisposable)

```csharp
public class DatabaseConnection : IDisposable
{
    private bool disposed = false;
    private IntPtr dbHandle; // Неуправляемый ресурс
    
    public DatabaseConnection()
    {
        // Открытие соединения с базой данных
        dbHandle = OpenDatabase();
    }
    
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this); // Предотвращает вызов финализатора
    }
    
    protected virtual void Dispose(bool disposing)
    {
        if (!disposed)
        {
            if (disposing)
            {
                // Освобождение управляемых ресурсов
            }
            
            // Освобождение неуправляемых ресурсов
            CloseDatabase(dbHandle);
            dbHandle = IntPtr.Zero;
            
            disposed = true;
        }
    }
    
    ~DatabaseConnection()
    {
        Dispose(false);
    }
    
    private IntPtr OpenDatabase()
    {
        // Код открытия базы данных
        return new IntPtr(1);
    }
    
    private void CloseDatabase(IntPtr handle)
    {
        // Код закрытия базы данных
    }
}
```

### Использование using для автоматического вызова Dispose

```csharp
static void Main()
{
    using (DatabaseConnection connection = new DatabaseConnection())
    {
        // Работа с соединением
    } // Здесь автоматически вызывается connection.Dispose()
}
```

### Ручной вызов сборки мусора

Обычно не рекомендуется, но возможен:

```csharp
static void Main()
{
    // Создание и использование множества объектов
    // ...
    
    // Подсказка сборщику мусора, что сейчас хорошее время для сборки
    GC.Collect();
    GC.WaitForPendingFinalizers();
}
```

Это основные принципы и шаги алгоритма сборки мусора в C#. Автоматический менеджмент памяти — одно из главных преимуществ C#, позволяющее разработчикам сосредоточиться на бизнес-логике, а не на ручном управлении памятью.