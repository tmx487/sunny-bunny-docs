---
уровень: 
секция: 
пройдено: 
теги: 
дата: 08-05-2024
время: 12:57
---
 ### Examples

![[Pasted image 20240205143848.png]]

#### ValidationOnAttributes: pro's and con's

![[Pasted image 20240205144725.png]]

[-]: как прописать много правил (как в строке с именем)
[-]: атрибут Future не логично использовать для свойства Savory, но валидация через атрибуты это позволяет делать
[-]: невозможно установить условия проверки, чтобы конечная дата была больше чем начальная

Все эти минусы решает FluentValidation

#### PipeLineBehaviours 

Правила именования методов в тестах

```csharp
public class RegisterCommandHandlerTests
{
	// T1: system under test (what we are testing; logical component)
	// T2: the specific scenario, which we are testing 
	// T3: expected outcome
	public void T1_T2_T3()
	{
		// Arrange
		// Get hold of a valid register data
		
		// Act
		// Invoke the handler
		
		// Assert
		// 1. Validate correct user created based on command
		// 2. Add user to repository
	}
}
```

![[Pasted image 20240311182136.png]]


![[Pasted image 20240311190148.png]]
