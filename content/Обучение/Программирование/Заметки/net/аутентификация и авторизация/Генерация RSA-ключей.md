
```powershell
openssl genpkey -algorithm RSA -out private-key.pem -pkeyopt rsa_keygen_bits:2048 openssl rsa -pubout -in private-key.pem -out public-key.pem
```


💡 **Что делают команды?**

- **Первая команда** генерирует **приватный ключ** (`private-key.pem`).
- **Вторая команда** извлекает из него **публичный ключ** (`public-key.pem`).

После выполнения этих команд у вас появятся два файла:

- **private-key.pem** — храните его в защищенном месте, используйте только в **AuthService**.
- **public-key.pem** — можно использовать в других микросервисах для проверки токенов.