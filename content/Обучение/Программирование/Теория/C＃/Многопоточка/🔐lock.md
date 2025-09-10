
`lock` гарантирует, что **только один поток за раз** может выполнять блок кода, заключённый в `lock`.

Пример:

```csharp
private static readonly object locker = new object();

lock (locker)
{
    // критическая секция — только один поток может быть здесь в данный момент
}
```

### 📌 Что происходит под капотом:

`lock(obj)` — это обёртка над `Monitor.Enter(obj)` и `Monitor.Exit(obj)`:

```csharp
Monitor.Enter(obj);
try
{
    // critical section
}
finally
{
    Monitor.Exit(obj);
}
```

### ✅ Ключевые моменты:

- `obj` должен быть ссылочным типом (`object`, например). Чаще всего используется `private static readonly object locker = new object();`.
    
- Блокировка **по значимому типу (int, struct)** — ошибка.
    
- Если один поток вошёл в `lock`, другие потоки **ждут**, пока он выйдет из него.
    
- Используется для защиты **общих ресурсов** от одновременного доступа.
    

---

## 🚧 Что защищают с помощью `lock`?

- Счётчики (например, `counter++`)
    
- Коллекции (списки, очереди)
    
- Запись/чтение файлов
    
- Работа с базой/сокетами
    

---

## 🔁 Пример: без `lock` — race condition

```csharp
int counter = 0;

void Increment()
{
    for (int i = 0; i < 1000; i++)
    {
        counter++; // НЕ атомарно — возможны потери
    }
}
```

---

## ✅ То же с `lock`

```csharp
int counter = 0;
object locker = new object();

void Increment()
{
    for (int i = 0; i < 1000; i++)
    {
        lock (locker)
        {
            counter++; // гарантированно безопасно
        }
    }
}
```

### 🔹 Зачем нужен `obj` в `lock (obj) {...}`?

Параметр `obj` — это **объект-блокировка** (часто называют `locker`, `lockObj`, `syncRoot` и т.д.).

---

### ✅ Его задача — быть "ключом" к критической секции:

Когда ты пишешь:

```csharp
lock(obj)
{
    // критическая секция
}
```

ты говоришь:

> "Поток, прежде чем войти в этот блок, должен получить **монитор** (блокировку) на объект `obj`. Если другой поток уже захватил его — подожди."

---

### 📌 Почему именно `object`, а не, например, `int` или `string`?

- `obj` должен быть **ссылочным типом** (`object`, `class` и т.д.).
    
- **Значимые типы (value types)** (например, `int`, `bool`) нельзя использовать — они копируются при передаче, и блокировка не работает как надо.
    
- Не стоит использовать `string` как `lock`-объект — строковые литералы интернированы в CLR, и ты можешь случайно синхронизироваться с чужим кодом.
    

---

### ✅ Хорошая практика:

```csharp
private static readonly object locker = new object();

lock (locker)
{
    // этот код никогда не будет выполняться одновременно разными потоками
}
```

Таким образом, `locker` — это просто **метка** (сигнальный объект), по которой потоки синхронизируют доступ к коду или ресурсу.

# Почему важно, чтобы объект `lock` был **общим** для всех потоков, а не уникальным в каждом

---

## ❌ Пример с двумя разными объектами (`lock` НЕ работает):

```csharp
using System;
using System.Threading;

class Program
{
    static void Main()
    {
        object lock1 = new object();
        object lock2 = new object();

        Thread t1 = new Thread(() => DoWork("Thread 1", lock1));
        Thread t2 = new Thread(() => DoWork("Thread 2", lock2));

        t1.Start();
        t2.Start();

        t1.Join();
        t2.Join();
    }

    static void DoWork(string name, object locker)
    {
        for (int i = 0; i < 3; i++)
        {
            lock (locker)
            {
                Console.WriteLine($"{name} enters critical section.");
                Thread.Sleep(500); // имитация работы
                Console.WriteLine($"{name} exits critical section.");
            }
        }
    }
}
```

### 🔍 Что будет?

**`lock1` и `lock2` — это два разных объекта**, значит **потоки не синхронизируются**, и оба могут войти в критическую секцию одновременно.

👉 То есть на экране строки от `Thread 1` и `Thread 2` могут чередоваться, накладываться и даже выполняться параллельно.

---

## ✅ Пример с одним общим объектом (`lock` РАБОТАЕТ правильно):

```csharp
using System;
using System.Threading;

class Program
{
    private static readonly object sharedLock = new object();

    static void Main()
    {
        Thread t1 = new Thread(() => DoWork("Thread 1"));
        Thread t2 = new Thread(() => DoWork("Thread 2"));

        t1.Start();
        t2.Start();

        t1.Join();
        t2.Join();
    }

    static void DoWork(string name)
    {
        for (int i = 0; i < 3; i++)
        {
            lock (sharedLock)
            {
                Console.WriteLine($"{name} enters critical section.");
                Thread.Sleep(500);
                Console.WriteLine($"{name} exits critical section.");
            }
        }
    }
}
```

### 🔍 Что будет?

Теперь **оба потока используют один и тот же `sharedLock`**, значит только один поток заходит в критическую секцию за раз. Вывод будет строго последовательно:

```
Thread 1 enters critical section.
Thread 1 exits critical section.
Thread 2 enters critical section.
Thread 2 exits critical section.
...
```

Вот пошаговая **временная диаграмма**, показывающая, как работает `lock` с общим объектом.

---

## 🔧 Код (для примера):

```csharp
private static readonly object sharedLock = new object();

static void Main()
{
    Thread t1 = new Thread(() => DoWork("T1"));
    Thread t2 = new Thread(() => DoWork("T2"));

    t1.Start();
    t2.Start();

    t1.Join();
    t2.Join();
}

static void DoWork(string name)
{
    for (int i = 0; i < 2; i++)
    {
        lock (sharedLock)
        {
            Console.WriteLine($"{name} enters");
            Thread.Sleep(500); // имитация работы
            Console.WriteLine($"{name} exits");
        }
    }
}
```

---

## 📈 Временная диаграмма выполнения (по 0.5 секунды)

|Время (сек)|Поток T1|Поток T2|
|---|---|---|
|0.0|`lock` захвачен|ждет `sharedLock`|
|0.5|в критической секции|ждет|
|1.0|`lock` освобожден|`lock` захвачен|
|1.5|ждет|в критической секции|
|2.0|`lock` захвачен|ждет|
|2.5|в критической секции|ждет|
|3.0|`lock` освобожден|`lock` захвачен|
|3.5|ждет|в критической секции|
|4.0|завершен|завершен|

---

## 🔁 Что происходит:

1. **T1 запускается и сразу входит в `lock`**, потому что объект свободен.
    
2. **T2 запускается и ждет**, пока T1 выйдет из критической секции.
    
3. Как только T1 освободит `sharedLock`, **T2 заходит внутрь**.
    
4. Это повторяется, т.к. цикл по 2 итерации.
    

---

## ☝️ Вывод программы будет:

```
T1 enters
T1 exits
T2 enters
T2 exits
T1 enters
T1 exits
T2 enters
T2 exits
```

> Порядок T1–T2 может быть обратным, если планировщик ОС сначала запустит T2 — но **перемешивания внутри `lock` не будет никогда**.
