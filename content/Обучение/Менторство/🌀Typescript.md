![[Pasted image 20250618103444.png]]

![[Pasted image 20250618103508.png]]

![[Pasted image 20250618103522.png]]

![[Pasted image 20250618103554.png]]

![[Pasted image 20250618103623.png]]
![[Pasted image 20250618103640.png]]

Если функция ждет тип Person, а ей передали User, то т.к. оба эти типа содержат одинаковые свойства, функция будет работать нормально.

![[Pasted image 20250618103810.png]]

![[Pasted image 20250618103827.png]]

![[Pasted image 20250618103900.png]]

![[Pasted image 20250618103915.png]]

![[Pasted image 20250618103942.png]]

![[Pasted image 20250618103954.png]]

![[Pasted image 20250618104009.png]]
![[Pasted image 20250618104105.png]]

![[Pasted image 20250618104131.png]]

![[Pasted image 20250618104201.png]]

![[Pasted image 20250618104209.png]]

![[Pasted image 20250618105112.png]]

![[Pasted image 20250618105146.png]]
![[Pasted image 20250618105217.png]]

![[Pasted image 20250618105327.png]]

>*Правила выше работают и на передачу аргументов в функции и прочие операции, а не только присвоение*

![[Pasted image 20250618105614.png]]

![[Pasted image 20250618105703.png]]

***Any*** - как бы отключает типизацию. Не стоит использовать в реальном проекте, т.к. этот тип "убивает" весь эффект типизации.

![[Pasted image 20250618105809.png]]

![[Pasted image 20250618105943.png]]

***Unknown*** - безопасный аналог *Any*, т.к. заставляет делать проверку типов. 

![[Pasted image 20250618110133.png]]

![[Pasted image 20250618110150.png]]


![[Pasted image 20250618110224.png]]


![[Pasted image 20250618110325.png]]

![[Pasted image 20250618110347.png]]

![[Pasted image 20250618110416.png]]

![[Pasted image 20250618110532.png]]

![[Pasted image 20250618110847.png]]

Чтобы описать составной тип можно использовать два способа:

- interface
- type

![[Pasted image 20250618111000.png]]

![[Pasted image 20250618111014.png]]

>***Если поле в типе необязательное, то чтобы это показать, нужно добавить знак вопроса после названия поля:***

![[Pasted image 20250618111120.png]]

![[Pasted image 20250618111143.png]]

![[Pasted image 20250618111255.png]]

![[Pasted image 20250618111333.png]]

![[Pasted image 20250618111455.png]]

![[Pasted image 20250618111516.png]]

![[Pasted image 20250618111605.png]]

***Чтобы объявить поле объекта как readonly, нужно добавить `as const` в объявление объекта:***

![[Pasted image 20250618111633.png]]


![[Pasted image 20250618111744.png]]

***Шаблонные строки EventName, EventHandler***

![[Pasted image 20250618111819.png]]

![[Pasted image 20250618111939.png]]

![[Pasted image 20250618111946.png]]

![[Pasted image 20250618112139.png]]

![[Pasted image 20250618112214.png]]

![[Pasted image 20250618112236.png]]


![[Pasted image 20250618112419.png]]

![[Pasted image 20250618112501.png]]

Constraints

![[Pasted image 20250618112626.png]]

![[Pasted image 20250618112712.png]]

![[Pasted image 20250618112745.png]]

Conditional Types

![[Pasted image 20250618113030.png]]

![[Pasted image 20250618113255.png]]

# Сужение типов

![[Pasted image 20250618113540.png]]

![[Pasted image 20250618113621.png]]

![[Pasted image 20250618113758.png]]

![[Pasted image 20250618113848.png]]

## Discriminated union

![[Pasted image 20250618113938.png]]

![[Pasted image 20250618114101.png]]

![[Pasted image 20250618114132.png]]

# Type guards

![[Pasted image 20250618114327.png]]

# Преобразование типов

![[Pasted image 20250618114519.png]]

![[Pasted image 20250618114531.png]]

**Type assertion**

![[Pasted image 20250618114607.png]]

![[Pasted image 20250618114748.png]]

**Satisfies - не приводит к типу, а просто проверяет на то, есть ли все поля в нужном тип**

![[Pasted image 20250618114827.png]]

![[Pasted image 20250618114920.png]]

![[Pasted image 20250618121458.png]]

![[Pasted image 20250618121735.png]]

![[Pasted image 20250618121812.png]]

![[Pasted image 20250618121900.png]]

# typeof, keyof

![[Pasted image 20250618122004.png]]
![[Pasted image 20250618122146.png]]


![[Pasted image 20250618122205.png]]

![[Pasted image 20250618122252.png]]

![[Pasted image 20250618122328.png]]

![[Pasted image 20250618122514.png]]

# Optinal и non-null assertion

![[Pasted image 20250618122614.png]]

![[Pasted image 20250618122828.png]]

![[Pasted image 20250618122835.png]]

![[Pasted image 20250618123058.png]]

# enum

![[Pasted image 20250618130208.png]]

## const enum

![[Pasted image 20250618130408.png]]

![[Pasted image 20250618130510.png]]

### двустороннее связывание или двусторонний доступ

![[Pasted image 20250618130608.png]]

![[Pasted image 20250618130701.png]]

![[Pasted image 20250618130709.png]]

# type vs interface

![[Pasted image 20250618130904.png]]

***В скрипте может быть два интерфейса с одинаковыми названиями и разными полями, при использовании их поля просто объединятся. С типом такое не прокатит: тип должен быть уникальным***

# Mapped types

Типы, которые построены на основе других типов

![[Pasted image 20250618131901.png]]

![[Pasted image 20250618131936.png]]

# Utility Types













