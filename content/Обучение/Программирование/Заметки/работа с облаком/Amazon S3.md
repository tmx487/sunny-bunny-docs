## 1. Установка NuGet пакетов

```bash
dotnet add package AWSSDK.S3
dotnet add package AWSSDK.Extensions.NETCore.Setup
```

## 2. Конфигурация в appsettings.json

```json
{
  "AWS": {
    "Profile": "default",
    "Region": "us-east-1",
    "AccessKey": "your-access-key",
    "SecretKey": "your-secret-key",
    "BucketName": "your-bucket-name"
  }
}
```

## 3. Настройка DI в Program.cs

```csharp
using Amazon.S3;

var builder = WebApplication.CreateBuilder(args);

// Настройка AWS S3
builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());
builder.Services.AddAWSService<IAmazonS3>();

// Регистрация сервиса для работы с S3
builder.Services.AddScoped<IS3Service, S3Service>();

var app = builder.Build();
```

## 4. Создание сервиса для работы с S3

```csharp
public interface IS3Service
{
    Task<string> UploadFileAsync(IFormFile file, string fileName = null);
    Task<Stream> DownloadFileAsync(string fileName);
    Task<bool> DeleteFileAsync(string fileName);
    Task<List<string>> ListFilesAsync();
    Task<string> GetPresignedUrlAsync(string fileName, TimeSpan expiration);
}

public class S3Service : IS3Service
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly ILogger<S3Service> _logger;

    public S3Service(IAmazonS3 s3Client, IConfiguration configuration, 
                     ILogger<S3Service> logger)
    {
        _s3Client = s3Client;
        _bucketName = configuration["AWS:BucketName"];
        _logger = logger;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string fileName = null)
    {
        try
        {
            // Генерируем уникальное имя файла, если не передано
            fileName ??= $"{Guid.NewGuid()}-{file.FileName}";

            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName,
                InputStream = file.OpenReadStream(),
                ContentType = file.ContentType,
                ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256,
                Metadata = 
                {
                    ["original-name"] = file.FileName,
                    ["upload-time"] = DateTime.UtcNow.ToString("O")
                }
            };

            var response = await _s3Client.PutObjectAsync(request);
            
            if (response.HttpStatusCode == HttpStatusCode.OK)
            {
                _logger.LogInformation($"File uploaded successfully: {fileName}");
                return fileName;
            }
            
            throw new Exception($"Upload failed with status: {response.HttpStatusCode}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error uploading file: {fileName}");
            throw;
        }
    }

    public async Task<Stream> DownloadFileAsync(string fileName)
    {
        try
        {
            var request = new GetObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName
            };

            var response = await _s3Client.GetObjectAsync(request);
            return response.ResponseStream;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogWarning($"File not found: {fileName}");
            throw new FileNotFoundException($"File {fileName} not found in S3");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error downloading file: {fileName}");
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(string fileName)
    {
        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName
            };

            var response = await _s3Client.DeleteObjectAsync(request);
            
            _logger.LogInformation($"File deleted: {fileName}");
            return response.HttpStatusCode == HttpStatusCode.NoContent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting file: {fileName}");
            throw;
        }
    }

    public async Task<List<string>> ListFilesAsync()
    {
        try
        {
            var request = new ListObjectsV2Request
            {
                BucketName = _bucketName,
                MaxKeys = 1000
            };

            var response = await _s3Client.ListObjectsV2Async(request);
            return response.S3Objects.Select(obj => obj.Key).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing files");
            throw;
        }
    }

    public async Task<string> GetPresignedUrlAsync(string fileName, TimeSpan expiration)
    {
        try
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = fileName,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.Add(expiration)
            };

            return await _s3Client.GetPreSignedURLAsync(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error generating presigned URL for: {fileName}");
            throw;
        }
    }
}
```

## 5. API Controller

```csharp
[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IS3Service _s3Service;
    
    public FilesController(IS3Service s3Service)
    {
        _s3Service = s3Service;
    }
    
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is required");
        
        var fileName = await _s3Service.UploadFileAsync(file);
        return Ok(new { FileName = fileName, Message = "File uploaded successfully" });
    }
    
    [HttpGet("download/{fileName}")]
    public async Task<IActionResult> DownloadFile(string fileName)
    {
        var fileStream = await _s3Service.DownloadFileAsync(fileName);
        return File(fileStream, "application/octet-stream", fileName);
    }
    
    [HttpDelete("{fileName}")]
    public async Task<IActionResult> DeleteFile(string fileName)
    {
        var deleted = await _s3Service.DeleteFileAsync(fileName);
        return deleted ? Ok("File deleted successfully") : BadRequest("Delete failed");
    }
    
    [HttpGet("list")]
    public async Task<IActionResult> ListFiles()
    {
        var files = await _s3Service.ListFilesAsync();
        return Ok(files);
    }
    
    [HttpGet("presigned-url/{fileName}")]
    public async Task<IActionResult> GetPresignedUrl(string fileName, [FromQuery] int expirationMinutes = 60)
    {
        var expiration = TimeSpan.FromMinutes(expirationMinutes);
        var url = await _s3Service.GetPresignedUrlAsync(fileName, expiration);
        return Ok(new { Url = url, ExpiresIn = expiration.TotalMinutes });
    }
}
```

Error Handling Middleware:

```csharp
using System.Net;
using System.Text.Json;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = new ErrorResponse();

        switch (exception)
        {
            case FileNotFoundException:
                response.Message = "Requested file was not found";
                response.StatusCode = (int)HttpStatusCode.NotFound;
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                _logger.LogWarning(exception, "File not found: {Message}", exception.Message);
                break;
                
            case UnauthorizedAccessException:
                response.Message = "Access denied";
                response.StatusCode = (int)HttpStatusCode.Forbidden;
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                _logger.LogWarning(exception, "Access denied: {Message}", exception.Message);
                break;
                
            case ArgumentException:
            case ArgumentNullException:
                response.Message = "Invalid request parameters";
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                _logger.LogWarning(exception, "Bad request: {Message}", exception.Message);
                break;
                
            case TimeoutException:
                response.Message = "Request timeout";
                response.StatusCode = (int)HttpStatusCode.RequestTimeout;
                context.Response.StatusCode = (int)HttpStatusCode.RequestTimeout;
                _logger.LogError(exception, "Request timeout: {Message}", exception.Message);
                break;
                
            default:
                response.Message = "An internal server error occurred";
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}

public class ErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

// Регистрация middleware в Program.cs
public static class MiddlewareExtensions
{
    public static IApplicationBuilder UseErrorHandling(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ErrorHandlingMiddleware>();
    }
}
```

Регистрация в Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Добавляем сервисы
builder.Services.AddControllers();
builder.Services.AddScoped<IS3Service, S3Service>();

var app = builder.Build();

// Регистрируем middleware для обработки ошибок (важно - в начале pipeline)
app.UseErrorHandling();

app.UseRouting();
app.MapControllers();

app.Run();
```

## 6. Дополнительные возможности

### Работа с папками (префиксами)

```csharp
public async Task<string> UploadToFolderAsync(IFormFile file, string folderPath)
{
    var fileName = $"{folderPath.TrimEnd('/')}/{Guid.NewGuid()}-{file.FileName}";
    return await UploadFileAsync(file, fileName);
}

public async Task<List<string>> ListFilesInFolderAsync(string folderPath)
{
    var request = new ListObjectsV2Request
    {
        BucketName = _bucketName,
        Prefix = folderPath.TrimEnd('/') + "/",
        MaxKeys = 1000
    };

    var response = await _s3Client.ListObjectsV2Async(request);
    return response.S3Objects.Select(obj => obj.Key).ToList();
}
```

### Batch операции

```csharp
public async Task<List<string>> UploadMultipleFilesAsync(IFormFileCollection files)
{
    var uploadTasks = files.Select(file => UploadFileAsync(file));
    var results = await Task.WhenAll(uploadTasks);
    return results.ToList();
}

public async Task<bool> DeleteMultipleFilesAsync(List<string> fileNames)
{
    var deleteRequest = new DeleteObjectsRequest
    {
        BucketName = _bucketName,
        Objects = fileNames.Select(name => new KeyVersion { Key = name }).ToList()
    };

    var response = await _s3Client.DeleteObjectsAsync(deleteRequest);
    return response.DeletedObjects.Count == fileNames.Count;
}
```

## 7. Настройки безопасности

### Использование AWS IAM ролей (рекомендуется)

```csharp
// В Program.cs для production
builder.Services.AddDefaultAWSOptions(new AWSOptions
{
    Region = RegionEndpoint.GetBySystemName(builder.Configuration["AWS:Region"])
    // AccessKey и SecretKey не указываем - используем IAM роли
});
```

### Валидация файлов

```csharp
public class FileValidationService
{
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".pdf", ".docx" };
    private readonly long _maxFileSize = 10 * 1024 * 1024; // 10MB

    public bool IsValidFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return false;

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
            return false;

        if (file.Length > _maxFileSize)
            return false;

        return true;
    }
}
```

## 8. Использование в Razor Pages/Views

```html
<!-- Upload form -->
<form asp-action="UploadFile" enctype="multipart/form-data" method="post">
    <div class="form-group">
        <label for="file">Choose file:</label>
        <input type="file" name="file" id="file" class="form-control" required />
    </div>
    <button type="submit" class="btn btn-primary">Upload</button>
</form>

<!-- File list -->
<div id="fileList">
    <!-- Files will be loaded here via AJAX -->
</div>

<script>
// JavaScript для загрузки списка файлов
async function loadFiles() {
    const response = await fetch('/api/files/list');
    const files = await response.json();
    
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = files.map(file => 
        `<div>
            <a href="/api/files/download/${file}">${file}</a>
            <button onclick="deleteFile('${file}')">Delete</button>
         </div>`
    ).join('');
}

async function deleteFile(fileName) {
    await fetch(`/api/files/${fileName}`, { method: 'DELETE' });
    loadFiles(); // Refresh list
}
</script>
```

Этот код покрывает основные сценарии работы с S3: загрузка, скачивание, удаление файлов, получение списка и генерация временных ссылок.