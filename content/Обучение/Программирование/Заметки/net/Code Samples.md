```csharp
namespace MyApp.Application.Products.Commands
{
    public class CreateProductCommand : IRequest<int>
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
    }

    public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, int>
    {
        private readonly IProductRepository _productRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateProductCommandHandler(IProductRepository productRepository, IUnitOfWork unitOfWork)
        {
            _productRepository = productRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<int> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            var product = new Product
            {
                Name = request.Name,
                Price = request.Price,
                CategoryId = request.CategoryId
            };

            _productRepository.Add(product);

            await _unitOfWork.SaveChangesAsync();

            return product.Id;
        }
    }
}

namespace MyApp.Application.Products.Queries
{
    public class GetProductByIdQuery : IRequest<ProductDto>
    {
        public int Id { get; set; }
    }

    public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDto>
    {
        private readonly IProductRepository _productRepository;

        public GetProductByIdQueryHandler(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<ProductDto> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
        {
            var product = await _productRepository.GetByIdAsync(request.Id);

            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price
            };
        }
    }
}

namespace MyApp.Domain.Products
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
    }
}

namespace MyApp.Domain.Products.Repositories
{
    public interface IProductRepository : IRepository<Product>
    {
    }
}

namespace MyApp.Infrastructure.Data.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly MyAppDbContext _dbContext;

        public ProductRepository(MyAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public void Add(Product entity)
        {
            _dbContext.Products.Add(entity);
        }

        public async Task<Product> GetByIdAsync(int id)
        {
            return await _dbContext.Products.FindAsync(id);
        }
    }
}

namespace MyApp.Infrastructure.Data
{
    public class MyAppDbContext : DbContext, IUnitOfWork
    {
        public DbSet<Product> Products { get; set; }

        public MyAppDbContext(DbContextOptions<MyAppDbContext> options) : base(options)
        {
        }

        public async Task<int> SaveChangesAsync()
        {
            return await base.SaveChangesAsync();
        }
    }
}

namespace MyApp.Application
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
    }
}

// Интерфейсы для реализации репозитория и UnitOfWork

```


```csharp
// 1. Определение команды
public class UpdateDataCommand
{
    public int DataId { get; set; }
    public string NewValue { get; set; }
}

// 2. Реализация обработчика команды
public class UpdateDataCommandHandler
{
    private readonly IDataRepository _dataRepository;

    public UpdateDataCommandHandler(IDataRepository dataRepository)
    {
        _dataRepository = dataRepository;
    }

    public void Handle(UpdateDataCommand command)
    {
        // Логика обновления данных
        var data = _dataRepository.GetById(command.DataId);
        if (data != null)
        {
            data.Value = command.NewValue;
            _dataRepository.Update(data);
            _dataRepository.SaveChanges(); // Пример сохранения изменений в репозитории
        }
    }
}

// 3. Отправка команды
public class SomeService
{
    private readonly ICommandBus _commandBus;

    public SomeService(ICommandBus commandBus)
    {
        _commandBus = commandBus;
    }

    public void UpdateData(int dataId, string newValue)
    {
        var command = new UpdateDataCommand { DataId = dataId, NewValue = newValue };
        _commandBus.Send(command);
    }
}

```

![[Pasted image 20240501125317.png]]