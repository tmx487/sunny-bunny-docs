
В отличие от `Task<T>`, у `Thread` **нет встроенного способа возвращать результат**, потому что `Thread` — низкоуровневая абстракция и работает "в лоб".

---

## ✅ Как получить результат из `Thread`

Самый простой способ — использовать **общую переменную**, куда поток сохранит результат:

---

### 🧪 Пример:

```csharp
using System;
using System.Threading;

class Program
{
    static int result; // переменная для результата

    static void Main()
    {
        Thread thread = new Thread(Calculate);
        thread.Start();

        thread.Join(); // дожидаемся завершения потока

        Console.WriteLine($"Результат: {result}");
    }

    static void Calculate()
    {
        // Например, считаем сумму от 1 до 100
        int sum = 0;
        for (int i = 1; i <= 100; i++)
            sum += i;

        result = sum; // записываем в общую переменную
    }
}
```

---

## 🔒 Что с многопоточностью?

Если есть **несколько потоков**, и они пишут/читают из общих переменных, нужно:

- использовать `lock`
    
- или сделать переменную `volatile`
    
- или использовать типы из `System.Threading.Interlocked`
    

Но в простом случае, как выше — `Join()` гарантирует, что `result` уже будет установлен.

---

## 🧠 Альтернатива: Вернуть результат через `Task`

Если ты хочешь **удобно получать результат** — проще использовать `Task<T>`:

```csharp
var task = Task.Run(() =>
{
    int sum = 0;
    for (int i = 1; i <= 100; i++)
        sum += i;
    return sum;
});

int result = await task;
Console.WriteLine(result);
```