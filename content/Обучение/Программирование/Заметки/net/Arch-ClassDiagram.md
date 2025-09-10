```csharp
public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IMediator _mediator;

    public ProductService(IProductRepository productRepository, IMediator mediator)
    {
        _productRepository = productRepository;
        _mediator = mediator;
    }

    public async Task<Result> CreateProductAsync(ProductDto productDto)
    {
        var product = new Product(productDto.Name, productDto.Price);

        _productRepository.Add(product);

        await _productRepository.UnitOfWork.SaveChangesAsync();

        // Отправляем событие о создании нового продукта
        await _mediator.Publish(new ProductCreatedEvent(product.Id));

        return Result.Success();
    }
}
```

```csharp
public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;

    public void Add(Product product)
    {
        _context.Products.Add(product);
    }
}
```

```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct(ProductDto productDto)
    {
        var result = await _productService.CreateProductAsync(productDto);

        if (result.Success)
        {
            return Ok();
        }
        else
        {
            return BadRequest(result.Error);
        }
    }
}
```