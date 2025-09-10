```yaml
paths:
  /contacts:
    post:
      summary: Создание контакта
      description: Добавляет новый контакт
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: string
                  format: uuid
                  example: 123e4567-e89b-42d3-a456-556642440000
                firstName:
                  type: string
                  example: Иван
                surName:
                  type: string
                  example: Иванов
                partonymic:
                  type: string
                  example: Иванович
                  nullable: true
                phones:
                  type: array
                  items:
                    type: object
                    properties:
                      type:
                        type: string
                        example: home
                      number:
                        type: string
                        example: 375291265523
      responses:
        '201':
          description: Контакт успешно создан
        '400':
          description: Неверный формат данных
```
