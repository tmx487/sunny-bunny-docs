---
уровень: "[[junior]]"
секция: общее
пройдено: 
теги: 
дата: 02-05-2024
время: 19:25
---
**Call Stack** (стек вызова) - окно, в котором можно посмотреть текущий стек вызовов ф-й и процедур. При помощи свойства StackTrace типа System.Exception можно узнать имена и сигнатуры методов, вызов которых стал источником исключения. При этом стоит обратить внимание на следующий момент:

``` csharp
private void SomeMethod(){
	try {...}
	catch (Exception e) {
		...
		throw e;    // CLR считает, что исключение возникло здесь
	            // FxCop сообщает об ошибке
	}
}
```

 ``` csharp
private void SomeMethod(){
	try {...}
	catch (Exception e) {
		...
		throw ;      // CLR не меняет информацию о начальной точке исключения
		        // FxCop НЕ сообщает об ошибке
	}
}
```

> Note: **FxCop** runs post-build analysis on a compiled assembly