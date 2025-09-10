---
уровень: 
секция: 
пройдено: 
теги: 
дата: 08-05-2024
время: 12:56
---
==**CQS (Command Query Separation):**==

> A **command (procedure)** does something but does not return a result
> A **query (function or attribute)** return result but does not change the state
> 
> \- Bertrand Meyer 

The problem of CQS:
```csharp
interface IStack<T>
{
	void Push(T value); // command
	T Peek();         // query  
	T Pop();            // command or query ?
}
```

==**CQRS (Command Query Responsibility Sharing):**==

> The fundamental difference from CQS is that in CQRS objects are split {divided} into two objects, one containing the Commands one containing the Queries
> 
> \- Greg Young

```csharp
interface ICommandStack<T>
{
	void Push(T value);
	T Pop();
}

interface IQueryStack<T>
{
	T Peek();
}
```

![[Pasted image 20240125124018.png]]

![[Pasted image 20240205141719.png]]

 ![[Pasted image 20240205142237.png]]