---
уровень: "[[junior]]"
секция: 
пройдено: 
теги: 
дата: 02-05-2024
время: 21:07
---
Расскажите, что делает этот код, и предложите, как его улучшить.

_а)_
```csharp
public bool IsArrayEmpty(string[] array)  
{  
  if (array.Length > 0)  
    return false;  
  else  
    return true;  
}
```

_б)_
```c#
protected string GetClass(object url)  
{  
  string result = string.Empty;  
  if (SiteMap.CurrentNode != null && SiteMap.CurrentNode.Url == url.ToString())  
    result = "class=\"active\"";  
  return result;  
}
```