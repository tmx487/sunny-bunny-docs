The good news is, there’s an easy way to deal with this.

EF Core allows us to revert one or more migrations by running the `database update` command targeting an earlier migration:

```bash
dotnet ef database update Init -p TeacherResource.Infrastructure -s TeacherResource.API
```

>[!note]
>
>Consider subscribing and get **ASP.NET Core Web API Best Practices** eBook for [FREE!](https://code-maze.com/free-ebook-aspnetcore-webapi-best-practices/) 

The key here is **specifying the target migration** `Init` so that EF will roll back any later migrations:

```bash
Reverting migration '20231209231131_Hangar_HasDoors'
```

Done.

Then we will remove the last migration:

```bash
dotnet ef migrations remove -p TeacherResource.Infrastructure -s TeacherResource.API
```

Removing migration '20231209231131_Hangar_HasDoors'.

Reverting the model snapshot.

Done.

It’s also possible to revert to an even earlier migration and then run `dotnet ef migrations remove` multiple times to remove more than one migration.

That’s it! Once we’ve removed the faulty migration, we can make changes to our model and add a new migration to replace it.