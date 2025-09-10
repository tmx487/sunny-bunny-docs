# 1. Метрики производительности HTTP-запросов (Application Performance Metrics)

Это, пожалуй, самые важные метрики для любого веб-приложения.

- **`http_server_requests_total` (Counter):** Общее количество полученных HTTP-запросов.
    - **Label:** `method` (GET, POST, PUT, DELETE и т.д.), `status_code` (200, 404, 500 и т.д.), `route` (шаблон маршрута, например, `/api/users/{id}`), `host`.
    - **Почему важно:** Позволяет отслеживать нагрузку на приложение, видеть распределение запросов по методам, статус-кодам и маршрутам.
- **`http_server_request_duration_seconds` (Histogram/Summary):** Длительность обработки HTTP-запросов.
    - **Label:** `method`, `status_code`, `route`, `host`.
    - **Почему важно:** Позволяет определить, какие запросы медленные, где возникают "узкие места". Гистограмма дает распределение времени ответа (например, 90-й или 99-й перцентиль), что гораздо информативнее среднего значения.
- **`http_server_active_requests` (Gauge):** Количество одновременно обрабатываемых HTTP-запросов.
    - **Почему важно:** Показывает текущую загрузку сервера. Резкий рост может указывать на зависания или нехватку ресурсов.
- **`http_server_error_responses_total` (Counter):** Количество запросов, завершившихся с ошибками (например, 5xx статус-коды).
    - **Label:** `status_code`, `route`, `error_type` (если можно классифицировать).
    - **Почему важно:** Быстрое обнаружение проблем и ошибок на стороне сервера.
- **`http_client_requests_total` (Counter) и `http_client_request_duration_seconds` (Histogram/Summary):** Если ваше приложение делает запросы к другим сервисам (например, через `HttpClient`), полезно отслеживать производительность этих исходящих запросов.
    - **Label:** `target_host`, `method`, `status_code`.

# 2. Метрики использования ресурсов (System/Runtime Metrics)

Эти метрики отражают общее состояние процесса ASP.NET Core и underlying системы. Многие из них предоставляются .NET Runtime (через EventCounters).

- **`process_cpu_usage_percentage` (Gauge):** Процент использования CPU процессом ASP.NET Core.
    - **Почему важно:** Высокое использование CPU может указывать на интенсивные вычисления, бесконечные циклы или проблемы с параллелизмом.
- **`process_memory_working_set_bytes` (Gauge):** Объем оперативной памяти, используемый процессом (Working Set).
    - **Почему важно:** Рост потребления памяти без отпускания может указывать на утечки памяти.
- **`process_memory_virtual_bytes` (Gauge):** Объем виртуальной памяти, используемый процессом.
- **`dotnet_gc_total_heap_size_bytes` (Gauge):** Общий размер кучи, управляемой сборщиком мусора (GC).
    - **Почему важно:** В сочетании с метриками использования памяти помогает понять поведение GC и выявить потенциальные проблемы с памятью.
- **`dotnet_gc_gen0_collections_total`, `dotnet_gc_gen1_collections_total`, `dotnet_gc_gen2_collections_total` (Counter):** Количество сборок мусора по поколениям.
    - **Почему важно:** Частые Gen2 сборки могут указывать на проблемы с выделением памяти.
- **`dotnet_thread_pool_thread_count` (Gauge):** Количество потоков в пуле потоков.
- **`dotnet_thread_pool_queue_length` (Gauge):** Длина очереди потоков в пуле потоков.
    - **Почему важно:** Высокая длина очереди может означать, что пулу потоков не хватает ресурсов для обработки задач.
- **`dotnet_exceptions_total` (Counter):** Общее количество исключений.
    - **Label:** `exception_type`.
    - **Почему важно:** Обнаружение и классификация ошибок на уровне приложения.
- **`kestrel_connections_total` (Counter), `kestrel_current_connections` (Gauge):** Метрики HTTP-сервера Kestrel, если он используется.

# 3. Бизнес-метрики и кастомные метрики (Business/Custom Metrics)

Эти метрики специфичны для вашего приложения и его бизнес-логики.

- **`users_registered_total` (Counter):** Количество новых зарегистрированных пользователей.
- **`orders_placed_total` (Counter):** Количество оформленных заказов.
- **`login_attempts_total` (Counter):** Количество попыток входа в систему.
    - **Label:** `status` (success, failure).
- **`api_calls_processed_total` (Counter):** Количество вызовов специфичных API-методов.
    - **Label:** `api_name`.
- **`database_queries_duration_seconds` (Histogram/Summary):** Время выполнения запросов к базе данных.
    - **Label:** `query_type` (SELECT, INSERT, UPDATE, DELETE), `table_name`.
- **`message_queue_processed_total` (Counter):** Количество обработанных сообщений из очереди.
    - **Label:** `queue_name`, `status` (success, failure).
- **`cache_hits_total`, `cache_misses_total` (Counter):** Эффективность кэширования.

# 4. Метрики состояния и доступности (Health and Availability Metrics)

- **`application_up` (Gauge):** Простая метрика, которая всегда равна 1, если приложение запущено, и 0, если нет (обычно выставляется Prometheus, если он может скрапить endpoint).
- **`health_check_status` (Gauge):** Результат проверки работоспособности (например, 0 - неисправно, 1 - исправно).
    - **Label:** `check_name` (database, external_service, etc.).
- **`last_successful_heartbeat_timestamp_seconds` (Gauge):** Время последнего успешного "сердцебиения" (полезно для асинхронных процессов).

# Как собирать метрики в ASP.NET Core для Prometheus

Для сбора метрик в ASP.NET Core и экспорта их для Prometheus чаще всего используют библиотеку `prometheus-net`. Она предоставляет удобные API для создания и регистрации различных типов метрик (Counter, Gauge, Histogram, Summary) и middleware для публикации `/metrics` endpoint, который Prometheus может "скрапить".

Начиная с .NET 8, ASP.NET Core также включает встроенную поддержку метрик (через `System.Diagnostics.Metrics` и `HttpMetrics`), которые можно экспортировать через OpenTelemetry в Prometheus.

Выбор конкретных метрик будет зависеть от сложности вашего приложения, его зависимостей и бизнес-логики. Начните с базовых метрик HTTP и системных ресурсов, а затем добавляйте кастомные метрики по мере необходимости, чтобы получить полную картину производительности и здоровья вашего приложения.