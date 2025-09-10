---
уровень: "[[middle]]"
секция: 
пройдено: 
теги: 
дата: 02-05-2024
время: 21:11
---
Расскажите, что делает этот код, и предложите, как его улучшить:

_а)_
```c#
Shape shape = GetNextShape();  
if(shape is Circle)  
Console.WriteLine(((Circle)shape).Radius);
```

_б)_
```c#
public int Quantity  
{  
  get  
  {  
    try  
    {  
      return int.Parse(TxtQuantity.Text);  
    }  
    catch (Exception)  
    {  
      return 0;  
    }  
  }  
}
```