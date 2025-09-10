#### 1. **Настройка подписания токенов (`SigningCredentials`) в IdentityServer**

- Должна быть в **AuthService**, так как этот сервис отвечает за выдачу и подпись токенов.

#### 2. **Генерация пары RSA-ключей**

- Это нужно делать в **AuthService**, так как он подписывает токены.
- Ключи можно хранить в **appsettings.json**, в **секретах Kubernetes**, в **базе данных** или использовать сертификат.

#### 3. **Настройка проверки подписанных токенов**

- Должна быть в **TopicService** (или любом другом микросервисе, который проверяет access-токены).

---

## **1. Изменения в AuthService (Где выдаются токены)**

В `Program.cs` (или `Startup.cs`, если используете `Startup`) настройте **подписывающий ключ**:

```csharp
var rsa = RSA.Create();
rsa.ImportFromPem(File.ReadAllText("private-key.pem"));

var signingKey = new RsaSecurityKey(rsa);
builder.Services.AddIdentityServer()
    .AddSigningCredential(new SigningCredentials(signingKey, SecurityAlgorithms.RsaSha256))
    .AddInMemoryClients(IdentityConfig.GetClients())
    .AddInMemoryApiScopes(IdentityConfig.GetApiScopes())
    .AddInMemoryApiResources(IdentityConfig.GetApiResources())
    .AddAspNetIdentity<ApplicationUser>();
```

💡 **Где хранить ключи?**  
Файл `private-key.pem` должен быть заранее создан и храниться в безопасном месте.

#### **Как создать ключи RSA?**

Создайте их с помощью OpenSSL:

```sh
openssl genpkey -algorithm RSA -out private-key.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in private-key.pem -out public-key.pem
```

---

## **2. Изменения в коде генерации токенов (AuthService)**

Вместо симметричного ключа (HMAC) нужно использовать **RSA**:

```csharp
public string GenerateAccessToken(string userId, string email, string[] roles)
{
    var rsa = RSA.Create();
    rsa.ImportFromPem(File.ReadAllText("private-key.pem"));

    var signingCredentials = new SigningCredentials(
        new RsaSecurityKey(rsa),
        SecurityAlgorithms.RsaSha256);

    var accessClaims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(JwtRegisteredClaimNames.Email, email),
        new Claim("userId", userId)
    };

    foreach (var role in roles)
    {
        accessClaims.Add(new Claim("role", role));
    }

    var accessToken = new JwtSecurityToken(
        claims: accessClaims,
        signingCredentials: signingCredentials,
        issuer: _jwtSettings.Issuer,
        audience: _jwtSettings.Audience,
        expires: _dateTimeProvider.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpiresMinutes));

    return new JwtSecurityTokenHandler().WriteToken(accessToken);
}
```

---

## **3. Изменения в TopicService (Где проверяется токен)**

В `Program.cs` (`Startup.cs`), настройте **аутентификацию с RSA**:

```csharp
var rsa = RSA.Create();
rsa.ImportFromPem(File.ReadAllText("public-key.pem"));

var publicKey = new RsaSecurityKey(rsa);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://localhost:7160";
        options.Audience = "auth-api";
        options.RequireHttpsMetadata = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidIssuer = "TeacherResource",
            ValidAudience = "TeacherResource",
            IssuerSigningKey = publicKey
        };
    });
```

---

## **Вывод**

1. В **AuthService** (сервис авторизации):
    
    - Генерируется и подписывается токен с **приватным RSA-ключом**.
    - `private-key.pem` хранится на сервере в защищенном месте.
    - `AddSigningCredential` теперь использует RSA.
2. В **TopicService** (или любом другом сервисе):
    
    - Проверка подписи токена через **публичный RSA-ключ**.
    - `public-key.pem` хранится в `TopicService`.

💡 **Дополнительно**: Если у вас **несколько микросервисов**, лучше использовать **Kubernetes Secrets** или безопасное хранилище ключей (например, HashiCorp Vault, AWS KMS, Azure Key Vault).

Теперь все микросервисы смогут проверять токены, подписанные `AuthService`, без передачи приватного ключа. 🚀