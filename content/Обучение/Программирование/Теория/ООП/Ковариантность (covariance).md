**Ковариантность** (covariance) означает, что метод может возвратить тип, производный от типа, возвращаемого делегатом

```cs
delegate Object MyCallback(FileStream s);

String SomeMethod(Stream s); //ковариантность т.к. String потомок Object
```