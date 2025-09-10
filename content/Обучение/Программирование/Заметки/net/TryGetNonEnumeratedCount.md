---
дата: 24-05-2024
время: 19:58
tags: []
---
![[TryGetNonEnumeratedCount.png|700]]

💡В .NET 6 представлен новый метод Enumerable TryGetNonEnumeratedCount

Он определяет количество элементов в последовательности без необходимости принудительной итерации по ней.

Особенно полезно для IQueryable, когда при вызове метода Count вы не хотите выполнять полный запрос.

 by Oleg Kyrylchuk (https://x.com/okyrylchuk/status/1778120367862661332)