- События — это специальные делегаты, которые поддерживают подписку и отписку, позволяя объектам уведомлять подписчиков об изменениях (обычно об изменении состояния).
- События объявляются с использованием делегатов и могут быть вызваны только внутри класса, где они объявлены. Это обеспечивает инкапсуляцию.
- Подписчики могут подписываться на события с помощью оператора `+=`, и отписываться — с помощью `-=`.

```csharp
public delegate void MyDelegate(string message);

public class Publisher
{
    public event MyDelegate MyEvent;

    public void TriggerEvent(string msg)
    {
        MyEvent?.Invoke(msg); // Проверка на null перед вызовом события
    }
}

public class Subscriber
{
    public void OnEventTriggered(string message)
    {
        Console.WriteLine("Event triggered: " + message);
    }
}

class Program
{
    static void Main(string[] args)
    {
        Publisher publisher = new Publisher();
        Subscriber subscriber = new Subscriber();

        // Подписываемся на событие
        publisher.MyEvent += subscriber.OnEventTriggered;

        // Вызываем событие
        publisher.TriggerEvent("Hello, World!");
    }
}
/*
** В этом примере класс `Publisher` имеет событие, которое срабатывает, когда вызывается метод `TriggerEvent`.
Класс `Subscriber` подписывается на это событие и определяет, что делать, когда оно срабатывает.
*/
```