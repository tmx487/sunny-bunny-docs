**Контравариантность** (contra-variance) означает, что метод может принимать параметр, который является базовым для типа параметра делегата

```cs
delegate Object MyCallback(FileStream s);

String SomeMethod(Stream s); //контравариантность т.к. Stream базовый для FileStream
```