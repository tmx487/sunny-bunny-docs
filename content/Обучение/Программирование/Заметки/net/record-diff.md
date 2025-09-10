Почему есть различие

```csharp
public record NumberDto(string Type, string Number);

CreateMap<Contact, ContactDto>()
	.ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FullName.Firstname))
    .ForMember(dest => dest.SurName, opt => opt.MapFrom(src => src.FullName.Surname))
    .ForMember(dest => dest.Patronymic, opt => opt.MapFrom(src => src.FullName.Patronymic ?? ""))
    .ForMember(dest => dest.PhoneNumbers, opt => opt.MapFrom(
                src =>
                    src.PhoneNumbers == null
                    ? new List<NumberDto>()
                    : src.PhoneNumbers.Select(p => new NumberDto(p.Type.Title, p.Number)).ToList()
        ));
```

vs 

```csharp
public record NumberDto
{
    [SwaggerSchema("Phone's number type", Format = "string")]
    [SwaggerParameter("type", Required = true, Description = "Type of phone number")]
    [DefaultValue("дом")]
    public required string Type { get; set; }

    [SwaggerSchema("Phone's number", Format = "string")]
    [SwaggerParameter("number", Required = true, Description = "Phone's number")]
    [DefaultValue("375297635466")]
    public required string Number { get; set; }
}

CreateMap<Contact, ContactReadDto>()
    .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FullName.Firstname))
    .ForMember(dest => dest.SurName, opt => opt.MapFrom(src => src.FullName.Surname))
    .ForMember(dest => dest.Patronymic, opt => opt.MapFrom(src => src.FullName.Patronymic ?? ""))
    .ForMember(dest => dest.PhoneNumbers, opt => opt.MapFrom(
        src =>
            src.PhoneNumbers == null
            ? new List<NumberDto>()
            : src.PhoneNumbers.Select(p => new NumberDto { Type = p.Type.Title, Number = p.Number }).ToList()
    ));
```