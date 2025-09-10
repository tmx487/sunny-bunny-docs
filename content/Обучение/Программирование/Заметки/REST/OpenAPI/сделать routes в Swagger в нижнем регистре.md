```csharp
// Program.cs
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(c =>
    {
        // Convert routes to lowercase for Spec
        c.PreSerializeFilters.Add((swagger, httpReq) =>
        {
            var updatedPaths = new OpenApiPaths();
            foreach (var path in swagger.Paths)
            {
                updatedPaths.Add(path.Key.ToLowerInvariant(), path.Value);
            }
            swagger.Paths = updatedPaths;
        });
    });
    app.UseSwaggerUI();
}

```