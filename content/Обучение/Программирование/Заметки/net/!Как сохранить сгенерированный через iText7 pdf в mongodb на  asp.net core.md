Для сохранения PDF, сгенерированного с помощью iText7, в MongoDB в ASP.NET Core, можно выполнить несколько шагов. Основные из них:

1. **Генерация PDF с использованием iText7**.
    
2. **Превращение PDF в массив байтов**.
    
3. **Сохранение PDF в MongoDB**.
    

Вот пример, как это можно сделать:

### 1. Установка NuGet пакетов

Убедитесь, что у вас установлены необходимые пакеты:

```bash
dotnet add package iText7
dotnet add package MongoDB.Driver
```

### 2. Генерация PDF с помощью iText7

Создадим метод для генерации PDF и преобразования его в массив байтов.

```csharp
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using System.IO;

public byte[] GeneratePdf()
{
    using (var ms = new MemoryStream())
    {
        // Создание PDF документа
        var writer = new PdfWriter(ms);
        var pdf = new PdfDocument(writer);
        var document = new Document(pdf);
        
        // Добавление контента
        document.Add(new Paragraph("Hello, this is a test PDF"));

        // Завершаем создание PDF
        document.Close();

        // Возвращаем массив байтов PDF
        return ms.ToArray();
    }
}
```

### 3. Создание модели для MongoDB

Создайте модель, которая будет представлять PDF в базе данных.

```csharp
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class PdfDocument
{
    [BsonId]
    public ObjectId Id { get; set; }
    public byte[] Content { get; set; }
    public string FileName { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### 4. Сохранение PDF в MongoDB

Теперь создадим сервис для взаимодействия с MongoDB и сохранения PDF.

```csharp
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

public class PdfService
{
    private readonly IMongoCollection<PdfDocument> _pdfCollection;

    public PdfService(IMongoClient mongoClient)
    {
        var database = mongoClient.GetDatabase("YourDatabaseName");
        _pdfCollection = database.GetCollection<PdfDocument>("PdfDocuments");
    }

    public async Task SavePdfAsync(byte[] pdfContent, string fileName)
    {
        var pdfDoc = new PdfDocument
        {
            Content = pdfContent,
            FileName = fileName,
            CreatedAt = DateTime.UtcNow
        };

        await _pdfCollection.InsertOneAsync(pdfDoc);
    }
}
```

### 5. Использование сервиса для сохранения PDF в MongoDB

В вашем контроллере или сервисе вызывайте метод для генерации PDF и его сохранения в MongoDB.

```csharp
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

public class PdfController : ControllerBase
{
    private readonly PdfService _pdfService;

    public PdfController(PdfService pdfService)
    {
        _pdfService = pdfService;
    }

    [HttpPost("save-pdf")]
    public async Task<IActionResult> SavePdf()
    {
        // Генерация PDF
        var pdfContent = GeneratePdf();

        // Сохранение PDF в MongoDB
        await _pdfService.SavePdfAsync(pdfContent, "example.pdf");

        return Ok("PDF saved successfully!");
    }

    private byte[] GeneratePdf()
    {
        // Ваш код генерации PDF (как в примере выше)
        return new byte[0]; // Замените на реальный код генерации
    }
}
```

### 6. Конфигурация MongoDB в `Startup.cs`

Не забудьте настроить подключение к MongoDB в `Startup.cs` или `Program.cs`, в зависимости от версии ASP.NET Core.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    var mongoClient = new MongoClient("your-mongo-connection-string");
    services.AddSingleton(mongoClient);
    services.AddScoped<PdfService>();
    
    services.AddControllers();
}
```

### Заключение

Теперь, когда вы вызываете API-метод `SavePdf`, он будет генерировать PDF, сохранять его в MongoDB в виде массива байтов и возвращать успешный ответ.

Вы можете адаптировать этот код под свои нужды, например, добавлять метаданные или улучшать обработку ошибок.