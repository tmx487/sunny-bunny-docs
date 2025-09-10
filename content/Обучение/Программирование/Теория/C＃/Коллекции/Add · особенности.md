"Естественное место" отражает **предназначение** коллекции:

- **List** — "Я храню элементы в порядке добавления"
- **Stack** — "Я работаю с последним добавленным"
- **Queue** — "Я работаю с первым добавленным"
- **HashSet** — "Я храню уникальные элементы быстро"
- **SortedSet** — "Я храню элементы в порядке"
- **Dictionary** — "Я связываю ключи со значениями"
## Коллекции .NET и метод Add(T item)

|✅ **Реализуют Add(T item)**|❌ **НЕ реализуют Add(T item)**|
|---|---|
|`List<T>`|`Queue<T>` (есть `Enqueue`)|
|`HashSet<T>`|`Stack<T>` (есть `Push`)|
|`SortedSet<T>`|`LinkedList<T>` (есть `AddFirst/AddLast`)|
|`ObservableCollection<T>`|`Dictionary<K,V>` (есть `Add(K,V)`)|
|`BindingList<T>`|`SortedDictionary<K,V>` (есть `Add(K,V)`)|
|`Collection<T>`|`SortedList<K,V>` (есть `Add(K,V)`)|
|`ConcurrentBag<T>`|`ConcurrentDictionary<K,V>` (есть `TryAdd`)|
|`BlockingCollection<T>`|`PriorityQueue<T,P>` (есть `Enqueue`)|
||`Array` (фиксированный размер)|
||`ReadOnlyCollection<T>` (только чтение)|
||`ImmutableList<T>` (Add возвращает новый список)|
||`ImmutableHashSet<T>` (Add возвращает новое множество)|
||`NameValueCollection` (есть `Add(string, string)`)|

## Дополнительные примечания

### ⚠️ Исключения через ICollection\<T>

Эти коллекции **технически** реализуют `ICollection<T>.Add()`, но выбрасывают `NotSupportedException`:

- `Queue<T>` (через интерфейс)
- `Stack<T>` (через интерфейс)
- `Array` (через интерфейс)

### 🔄 Возвращают новую коллекцию

- `ImmutableList<T>.Add()` → возвращает новый `ImmutableList<T>`
- `ImmutableHashSet<T>.Add()` → возвращает новый `ImmutableHashSet<T>`

### 📝 Альтернативные методы добавления

|Коллекция|Вместо Add используйте|
|---|---|
|`Queue<T>`|`Enqueue(T item)`|
|`Stack<T>`|`Push(T item)`|
|`LinkedList<T>`|`AddFirst(T)`, `AddLast(T)`|
|`Dictionary<K,V>`|`Add(TKey, TValue)`|
|`PriorityQueue<T,P>`|`Enqueue(T, TPriority)`|
|`ConcurrentDictionary<K,V>`|`TryAdd(TKey, TValue)`|

Основное правило: коллекции с **простой семантикой добавления** (списки, множества) имеют `Add(T)`, а **специализированные** коллекции (очереди, стеки, словари) используют более конкретные методы.