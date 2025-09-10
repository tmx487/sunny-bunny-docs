
```csharp
class Filter 
{
    public string FieldName {get;set;}
    public string FilterString {get;set;}
}
```

You can build a lambda expression to create a proper predicate using the `Expression` class.

```csharp
public static Expression<Func<TInput, bool>> CreateFilterExpression<TInput>(IEnumerable<Filter> filters)
{
    ParameterExpression param = Expression.Parameter(typeof(TInput), "");
    Expression lambdaBody = null;
    if (filters != null)
    {
        foreach (Filter filter in filters)
        {
            Expression compareExpression = Expression.Equal(
                    Expression.Property(param, filter.FieldName),
                    Expression.Constant(filter.FilterString));
            if (lambdaBody == null)
                lambdaBody = compareExpression;
            else
                lambdaBody = Expression.Or(lambdaBody, compareExpression);
        }
    }
    if (lambdaBody == null)
        return Expression.Lambda<Func<TInput, bool>>(Expression.Constant(false));
    else
        return Expression.Lambda<Func<TInput, bool>>(lambdaBody, param);
}
```

With this helper method, you can create an extension method on any `IQueryable<T>` class, so this should work for every LINQ backend:

```csharp
public static IQueryable<T> Where<T>(this IQueryable<T> source, 
                                          IEnumerable<Filter> filters)
{
    return Queryable.Where(source, CreateFilterExpression<T>(filters));
}
```

...which you can call like this:

```csharp
var query = context.Persons.Where(userFilters);
```

If you want to support `IEnumerable<T>` collections as well, you'll need to use this extra extension method:

```csharp
public static IEnumerable<T> Where<T>(this IEnumerable<T> source, 
                                           IEnumerable<Filter> filters)
{
    return Enumerable.Where(source, CreateFilterExpression<T>(filters).Compile());
}
```

Note that this only works for string properties. If you want to filter on fields, you'll need to change `Expression.Property` into `Expression.Field` (or `MakeMemberAccess`), and if you need to support other types than string properties, you'll have to provide more type information to the `Expression.Constant` part of the `CreateFilterExpression` method.