---
date: 03-06-2024
time: 19:04
tags: []
url: https://restfulapi.net/resource-naming/
---
### 1.2. Collection and Sub-collection Resources

A **resource may contain sub-collection resources** also.

For example, sub-collection resource `accounts` of a particular `customer` can be identified using the URN `/customers/{customerId}/accounts` (in a banking domain).

Similarly, a singleton resource `account` inside the sub-collection resource `accounts` can be identified as follows: `/customers/{customerId}/accounts/{accountId}`.

```http
/customers						//is a collection resource

/customers/{id}/accounts		// is a sub-collection resource
```

### Основные правила именования ресурсов

1. **Используйте существительные для ресурсов**:
    
    - Имена ресурсов должны быть существительными и описывать объекты, с которыми вы работаете.

```http
/users 
/products 
/orders
```

1. **Используйте множественное число**:
    
    - Используйте множественное число для имен ресурсов, чтобы показать, что они представляют коллекции.

```http
/users 
/products 
/orders
```
    
3. **Избегайте использования глаголов**:
    
    - Глаголы должны быть частью HTTP-методов (GET, POST, PUT, DELETE), а не путей.
 
```http
GET /users   // Получить список пользователей 
POST /users  // Создать нового пользователя 
GET /users/{id}  // Получить информацию о конкретном пользователе 
PUT /users/{id}  // Обновить информацию о пользователе 
DELETE /users/{id}  // Удалить пользователя
```
    
4. **Используйте "чистые" URL**:
    
    - Избегайте использования символов запроса в URL (например, `?`, `&`, `=`, `;`). Они должны использоваться только для фильтрации и сортировки.
```http
/users?age=30 

/products?category=electronics
```
    
5. **Иерархия ресурсов**:
    
    - Если ресурс является частью другого ресурса, используйте иерархические URL
	
```http
/users/{userId}/orders 

/products/{productId}/reviews
```
    
6. **Используйте подчеркивания или дефисы для улучшения читаемости**:
    
    - Выбирайте один стиль и придерживайтесь его (рекомендуется использовать дефисы).
```http
/user_profiles (менее предпочтительно) 

/user-profiles (более предпочтительно)
```
    
    
7. **Указывайте версии API**:
    
    - Используйте версионирование в URL, чтобы поддерживать совместимость с предыдущими версиями API.
```http
/v1/users 
/v2/users
```
	
8. **Используйте стандартные HTTP-методы**:
    
    - Сопоставляйте операции с правильными HTTP-методами:
        - GET: Получение ресурса или коллекции ресурсов.
        - POST: Создание нового ресурса.
        - PUT: Обновление существующего ресурса.
        - DELETE: Удаление ресурса.
```http
GET /users 
POST /users 
GET /users/{id} 
PUT /users/{id} 
DELETE /users/{id}
```


### Примеры

1. **Базовые операции с ресурсами**:

```http
GET /books         // Получить список всех книг 
POST /books        // Создать новую книгу 
GET /books/{id}    // Получить книгу по ID 
PUT /books/{id}    // Обновить информацию о книге по ID 
DELETE /books/{id} // Удалить книгу по ID
```    
    
2. **Вложенные ресурсы**:

```http
GET /authors/{authorId}/books           // Получить все книги автора

POST /authors/{authorId}/books          // Добавить новую книгу для автора

GET /authors/{authorId}/books/{bookId}  // Получить информацию о книге автора
										   по ID книги 
										   
PUT /authors/{authorId}/books/{bookId}  // Обновить информацию о книге автора 
										   по ID книги
										   
DELETE /authors/{authorId}/books/{bookId} // Удалить книгу автора по ID книги
```

3. **Фильтрация и сортировка**:

```http
GET /books?genre=fiction&sort=title  // Получить книги жанра "fiction",
										отсортированные по названию 

GET /books?author=John+Doe&year=2020 // Получить книги автора Джона Доу,
										опубликованные в 2020 году
```

    

### Дополнительные рекомендации

1. **Консистентность**:
    
    - Старайтесь соблюдать единый стиль и структуру во всем API, чтобы он был понятным и предсказуемым для пользователей.
2. **Документирование**:
    
    - Хорошо документируйте API, используя инструменты вроде Swagger, чтобы разработчики могли легко понять, как им пользоваться.
3. **Использование стандартов**:
    
    - Следуйте общепринятым стандартам и рекомендациям, таким как RESTful Best Practices, чтобы сделать ваш API более понятным и совместимым.

Следование этим правилам и рекомендациям поможет вам создать логичный и удобный в использовании RESTful API, который будет легко поддерживать и расширять.

![[RESTFull API Summary.png]]