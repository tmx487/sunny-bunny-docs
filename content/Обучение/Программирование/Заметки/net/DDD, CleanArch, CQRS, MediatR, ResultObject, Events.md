```csharp
// Доменные сущности
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    // Другие свойства...
}

// Доменные события
public class ProductCreatedEvent : INotification
{
    public Product Product { get; }

    public ProductCreatedEvent(Product product)
    {
        Product = product;
    }
}

// Классы-репозитории
public interface IProductRepository
{
    Task<Product> GetByIdAsync(int id);
    Task AddAsync(Product product);
    Task UpdateAsync(Product product);
    Task DeleteAsync(int id);
}

// Классы-сервисы
public interface IProductService
{
    Task<ResultObject<Product>> CreateProductAsync(Product product);
    Task<ResultObject<Product>> UpdateProductAsync(int id, Product product);
    Task<ResultObject> DeleteProductAsync(int id);
}

// Команды и запросы
public class CreateProductCommand : IRequest<ResultObject<Product>>
{
    public Product Product { get; }

    public CreateProductCommand(Product product)
    {
        Product = product;
    }
}

public class UpdateProductCommand : IRequest<ResultObject<Product>>
{
    public int Id { get; }
    public Product Product { get; }

    public UpdateProductCommand(int id, Product product)
    {
        Id = id;
        Product = product;
    }
}

public class DeleteProductCommand : IRequest<ResultObject>
{
    public int Id { get; }

    public DeleteProductCommand(int id)
    {
        Id = id;
    }
}

// Обработчики команд и запросов
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ResultObject<Product>>
{
    private readonly IProductRepository _productRepository;
    private readonly IMediator _mediator;

    public CreateProductCommandHandler(IProductRepository productRepository, IMediator mediator)
    {
        _productRepository = productRepository;
        _mediator = mediator;
    }

    public async Task<ResultObject<Product>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        await _productRepository.AddAsync(request.Product);
        await _mediator.Publish(new ProductCreatedEvent(request.Product), cancellationToken);
        return ResultObject<Product>.Success(request.Product);
    }
}

// Контроллеры
public class ProductController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct(Product product)
    {
        var result = await _mediator.Send(new CreateProductCommand(product));
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
    }

    // Аналогично для других методов контроллера (обновление, удаление и т. д.)
}

```