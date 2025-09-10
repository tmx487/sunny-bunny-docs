---
уровень: "[[junior]]"
секция: тестирование
пройдено: 
теги: 
дата: 02-05-2024
время: 20:10
---

Unit-тесты — это автоматизированные тесты, которые проверяют корректность работы отдельных частей кода (модулей или компонентов) в изоляции от других частей приложения. Они играют важную роль в процессе разработки программного обеспечения по следующим причинам:

### Основные преимущества и цели unit-тестов:

1. **Раннее выявление ошибок**:
    
    - Unit-тесты позволяют обнаруживать ошибки на ранних стадиях разработки. Чем раньше обнаружена ошибка, тем дешевле и проще ее исправить.
2. **Обеспечение корректности кода**:
    
    - Тесты проверяют, что отдельные части программы работают правильно, как предполагалось изначально. Это помогает удостовериться, что код соответствует требованиям.
3. **Упрощение рефакторинга**:
    
    - Наличие обширного набора unit-тестов позволяет безопасно вносить изменения в кодовую базу. Тесты помогают убедиться, что новые изменения не нарушили существующую функциональность.
4. **Поддержка и развитие кода**:
    
    - Unit-тесты служат своеобразной документацией для кода. Они показывают, как код должен работать, и помогают новым разработчикам понять его логику.
5. **Автоматизация и эффективность**:
    
    - Unit-тесты можно запускать автоматически при каждом сборке проекта, что ускоряет процесс тестирования и уменьшает вероятность пропуска ошибок.
6. **Уверенность в стабильности системы**:
    
    - Регулярное выполнение тестов увеличивает уверенность в том, что система остается стабильной и функциональной по мере её развития.

[[Библиотека/Статьи/xunit testing c# explained with code example _ Medium.pdf#page=4&selection=0,0,0,36|xunit testing c# explained with code example _ Medium, страница 4]]

## Test Method Naming Convention

First thing first, a test method needs to be named right, it should consist of three parts:

- The name of the method being tested.
- The scenario under which it’s being tested.
- The expected behaviour when the scenario is invoked.

**nameOfMethodBeingTested_Scenario_ExpectedBehaviour()**

```c#
public async Task<ActionResult<IEnumerable<Brand_DTO>>> GetAllBrands() { }

[Fact] public async Task GetAllBrands_ActionExecutes_CheckResultType_ReturnsBrand_DTOs { }
```

Another naming convention is to use 

**\<MethodName>_should_\<expectation>_when_\<condition>**

Example: `Constructor_should_throw_when_parameters_are_null`