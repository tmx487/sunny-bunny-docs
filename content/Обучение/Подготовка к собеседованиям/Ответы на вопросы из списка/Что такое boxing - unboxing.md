---
уровень: "[[junior]]"
секция: типы, структуры и коллекции данных
пройдено: 
теги: 
дата: 02-05-2024
время: 19:53
---
> Объекты значимого типа существуют в двух формах: **неупакованной** (unboxed) и **упакованной** (boxed). Ссылочные типы бывают **только в упакованной форме** 
> 
> -\ Рихтер, с.154


**boxing** - процесс конвертации значимого типа в объект типа `object` или какой-либо интерфейс, реализованный этим интерфейсом. When the common language runtime (CLR) boxes a value type, it wraps the value inside a System.Object instance and stores it on the managed heap. **Unboxing** extracts the value type from the object. **Boxing is implicit (==неявное==); unboxing is explicit (==явное==).** The concept of boxing and unboxing underlies the C# unified view of the type system in which a value of any type can be treated as an object.

```c#
int i = 123; 
object o = i; // boxing i
int z = (int)o; //unboxing o
```


![[упаковка-значимых-типов-01.png|500]]

**An unboxing operation consists of:**

- Checking the object instance to make sure that it is a boxed value of the given value type.
- Copying the value from the instance into the value-type variable.

![[упаковка-значимых-типов-00.png|500]]

```c#
int x = 423;
object q = x;
q = "hello";
int h = (int)q; // RTE: InvalidCastException 
Console.WriteLine($"x={x}, q={q}, h={h}");
```