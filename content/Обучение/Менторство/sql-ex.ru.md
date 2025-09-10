### использование `IN()` более оптимально, чем `OR`

```sql
-- 1; cost - 1,58
select model, speed, hd from pc where (cd = '12x' or cd = '24x') and price < 600
```


```sql
-- 2; cost - 1,68
select model, speed, hd from pc where cd IN ('12x', '24x') and price < 600
```

`IN()` работает еще лучше если на столбец, значения которого будут перебираться, повесить индекс

### UNION vs UNION ALL

| ❌                                                                                                                                                                                                                                                                                                                                                                                   | ✅                                                                                                                                                                                                                                                                                                                                           |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| select pc.model, price<br>from pc join product<br>on pc.model = product.model<br>where product.maker = 'B'<br>union<br>select Laptop.model, price<br>from Laptop join product<br>on Laptop.model = product.model<br>where product.maker = 'B'<br>union<br>select Printer.model, price<br>from Printer join product<br>on Printer.model = product.model<br>where product.maker = 'B' | SELECT all_products.model, price<br>FROM (<br>    SELECT pc.model, pc.price FROM pc<br>    UNION ALL<br>    SELECT laptop.model, laptop.price FROM laptop<br>    UNION ALL<br>    SELECT printer.model, printer.price FROM printer<br>) AS all_products<br>JOIN product ON all_products.model = product.model<br>WHERE product.maker = 'B'; |
##### **Почему вариант справа лучше?**

1. **Объединение данных** (`UNION ALL`) происходит **до соединения с `product`**, что уменьшает количество `JOIN`.
    
2. **Используется `UNION ALL` вместо `UNION`**, так как сортировка (`DISTINCT`) не требуется → быстрее.
    
3. **Фильтрация `product.maker = 'B'` выполняется один раз** после соединения, а не трижды.
    

##### 🔥 **Выигрыш в производительности**

- **Меньше `JOIN`** → PostgreSQL использует индекс на `product.model` эффективнее.
    
- **Меньше дубликатов (если `UNION ALL`)** → нет лишней сортировки.
    
- **Более читаемо и поддерживаемо**.

## **EXCEPT vs GROUP BY + FILTER**

```sql
-- 1; cost: 22.77; operations: 7
select maker
from (
select maker from product where type = 'PC'
EXCEPT
select maker from product where type = 'Laptop') x

-- 2; cost:7.45; operations: 2
SELECT maker
FROM product
GROUP BY maker
HAVING COUNT(*) FILTER (WHERE type = 'PC') > 0
   AND COUNT(*) FILTER (WHERE type = 'Laptop') = 0;
```

### **16**

```sql
-- my answer
select distinct max(x1.model), min(x1.model), x1.speed, x1.ram
from pc as x1, pc as x2
where x1.speed = x2.speed and x2.ram = x1.ram and x1.model <> x2.model
group by x1.speed, x1.ram
having count(*) >= 2

-- the right answer
SELECT distinct P.model, L.model, P.speed, P.ram
FROM PC P JOIN 
     (SELECT speed, ram
      FROM PC
      GROUP BY speed, ram
      HAVING COUNT(*) >= 2
      ) S ON P.speed = S.speed AND 
             P.ram = S.ram JOIN 
      PC L ON L.speed = S.speed AND 
              L.ram = S.ram AND 
              L.model < P.model;
```

### **17**

```sql
select distinct maker, price
from printer join product
 on printer.model = product.model
where color = 'y' and price = (select min(price) from printer where color = 'y')

-- better option
with min_price as(
  select min(price) as price from printer where color = 'y'
)
select distinct maker, printer.price
from printer
 join product on printer.model = product.model
 join min_price on printer.price = min_price.price
where color = 'y'
```

### **24**

```sql
with models_with_max_prices as(
 select model from pc where price = (select max(price) from pc)
union
select model from laptop where price = (select max(price) from laptop)
union
select model from printer where price = (select max(price) from printer)
)
select product.model
from product
join models_with_max_prices on product.model = models_with_max_prices.model
```

![[Pasted image 20250401143807.png]]
### **30**

```sql
select
 isnull(i.point, o.point) point,
 isnull(i.date, o.date) date,
 sum(o.out) outcome,
 sum(i.inc) income
from income i
  full join outcome o
    on i.point=o.point and i.date=o.date and i.code=o.code
  group by isnull(i.point, o.point), isnull(i.date, o.date)
```

### **40**

Найти производителей, которые выпускают более одной модели, при этом все выпускаемые производителем модели являются продуктами одного типа.  
Вывести: maker, type

```sql
select maker, max(type) -- можно использовать max(), т.к все равно будет только один тип
from product
group by maker
having count(model) > 1 and count(distinct type) = 1
```
