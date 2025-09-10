
При использовании Clean Architecture, CQRS (Command Query Responsibility Segregation) и MediatR, реализация пагинации, фильтрации и сортировки немного изменится, чтобы соответствовать этим паттернам и принципам. В данном контексте каждый компонент должен быть четко разделен на соответствующие слои и обработчики.

### 1. Создание запросов и команд

#### Создание запросов

Запросы будут представлены в виде отдельных классов, реализующих интерфейс `IRequest`.

```csharp
// Pagination and filter parameters
public class ProductFilterParams
{
    public string Name { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
}

public class PaginationParams
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class SortParams
{
    public string SortBy { get; set; }
    public string SortOrder { get; set; } = "asc";
}

// Query class
public class GetProductsQuery : IRequest<PagedResult<ProductDto>>
{
    public ProductFilterParams FilterParams { get; set; }
    public PaginationParams PaginationParams { get; set; }
    public SortParams SortParams { get; set; }
}
```

#### Создание команд

```csharp
public class CreateProductsCommand : IRequest
{
    public IEnumerable<ProductDto> Products { get; set; }
}
```

### 2. Создание обработчиков

#### Обработчик запроса

```csharp
public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PagedResult<ProductDto>>
{
    private readonly IProductRepository _productRepository;

    public GetProductsQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<PagedResult<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _productRepository.GetAll(); // This returns IQueryable<Product>
        query = query.ApplyFilter(request.FilterParams);
        query = query.ApplySort(request.SortParams);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((request.PaginationParams.Page - 1) * request.PaginationParams.PageSize)
                                .Take(request.PaginationParams.PageSize)
                                .Select(p => new ProductDto
                                {
                                    Id = p.Id,
                                    Name = p.Name,
                                    Price = p.Price
                                    // Map other properties
                                })
                                .ToListAsync(cancellationToken);

        return new PagedResult<ProductDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.PaginationParams.Page,
            PageSize = request.PaginationParams.PageSize
        };
    }
}
```

#### Обработчик команды

```csharp
public class CreateProductsCommandHandler : IRequestHandler<CreateProductsCommand>
{
    private readonly IProductRepository _productRepository;

    public CreateProductsCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Unit> Handle(CreateProductsCommand request, CancellationToken cancellationToken)
    {
        var products = request.Products.Select(p => new Product
        {
            // Map properties from DTO to entity
            Id = p.Id,
            Name = p.Name,
            Price = p.Price
            // Map other properties
        });

        await _productRepository.AddRangeAsync(products);
        return Unit.Value;
    }
}
```

### 3. Создание репозитория

```csharp
public interface IProductRepository
{
    IQueryable<Product> GetAll();
    Task AddRangeAsync(IEnumerable<Product> products);
}
```

### 4. Контроллер

#### Контроллер для запросов

```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] ProductFilterParams filterParams, [FromQuery] PaginationParams paginationParams, [FromQuery] SortParams sortParams)
    {
        var query = new GetProductsQuery
        {
            FilterParams = filterParams,
            PaginationParams = paginationParams,
            SortParams = sortParams
        };
        
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProducts([FromBody] IEnumerable<ProductDto> products)
    {
        var command = new CreateProductsCommand
        {
            Products = products
        };

        await _mediator.Send(command);
        return NoContent();
    }
}
```

### 5. Дополнительные расширения и вспомогательные классы

#### Методы расширения для фильтрации и сортировки

```csharp
public static class IQueryableExtensions
{
    public static IQueryable<Product> ApplyFilter(this IQueryable<Product> query, ProductFilterParams filterParams)
    {
        if (!string.IsNullOrEmpty(filterParams.Name))
        {
            query = query.Where(p => p.Name.Contains(filterParams.Name));
        }

        if (filterParams.MinPrice.HasValue)
        {
            query = query.Where(p => p.Price >= filterParams.MinPrice.Value);
        }

        if (filterParams.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= filterParams.MaxPrice.Value);
        }

        return query;
    }

    public static IQueryable<T> ApplySort<T>(this IQueryable<T> query, SortParams sortParams)
    {
        if (!string.IsNullOrEmpty(sortParams.SortBy))
        {
            var propertyInfo = typeof(T).GetProperty(sortParams.SortBy, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
            if (propertyInfo != null)
            {
                query = sortParams.SortOrder.ToLower() == "desc"
                    ? query.OrderByDescending(e => propertyInfo.GetValue(e, null))
                    : query.OrderBy(e => propertyInfo.GetValue(e, null));
            }
        }

        return query;
    }
}
```

### Заключение

Этот подход с использованием Clean Architecture, CQRS и MediatR позволяет добиться разделения ответственности, улучшить тестируемость и поддерживаемость кода. Каждый компонент имеет четко определенную роль, что упрощает развитие и масштабирование приложения.