---
уровень: "[[middle]]"
секция: 
пройдено: 
теги: 
дата: 02-05-2024
время: 21:10
---
Будет ли работать этот код и почему?

_а)_
```c#
SomeClass myClass = null;  
myClass.SomeMethod();
```

_б)_
```c#
var table = GetTable();  
table.Draw();  
…  
private SomeClass GetTable()  
{  
  using(var table = new SomeClass())  
  {  
    table.ID = "www";  
    table.Width = "95%";  
    table.Controls.Add(tr);  
    return table;  
  }  
}
```