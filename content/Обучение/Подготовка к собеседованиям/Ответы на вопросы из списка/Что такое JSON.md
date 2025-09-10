---
уровень: "[[junior]]"
секция: общее
пройдено: 
теги: 
дата: 02-05-2024
время: 19:17
---
[JSON (JavaScript Object Notation)](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON) - стандартный текстовый формат для представления структурированных данных на основе синтаксиса объектов JavaScript[^1][^2]

```json
{
  "squadName": "Super hero squad",
  "homeTown": "Metro City",
  "formed": 2016,
  "secretBase": "Super tower",
  "active": true,
  "members": [
    {
      "name": "Molecule Man",
      "age": 29,
      "secretIdentity": "Dan Jukes",
      "powers": ["Radiation resistance", "Turning tiny", "Radiation blast"]
    },
    {
      "name": "Madame Uppercut",
      "age": 39,
      "secretIdentity": "Jane Wilson",
      "powers": [
        "Million tonne punch",
        "Damage resistance",
        "Superhuman reflexes"
      ]
    },
    {
      "name": "Eternal Flame",
      "age": 1000000,
      "secretIdentity": "Unknown",
      "powers": [
        "Immortality",
        "Heat Immunity",
        "Inferno",
        "Teleportation",
        "Interdimensional travel"
      ]
    }
  ]
}
```

[^1]: JavaScript спроектирован на основе простой парадигмы. В основе концепции лежат простые объекты. **Объект** — это набор свойств, и каждое свойство состоит из имени и значения, ассоциированного с этим именем. Значением свойства может быть функция, которую можно назвать методом объекта. В дополнение к встроенным в браузер объектам, вы можете определить свои собственные объекты (см. [подробнее](https://developer.mozilla.org/ru/docs/Web/JavaScript/Guide/Working_with_Objects)).
[^2]: [RFC 8259: The JavaScript Object Notation (JSON) Data Interchange Format](https://datatracker.ietf.org/doc/html/rfc8259)