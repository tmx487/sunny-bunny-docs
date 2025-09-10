---
link: https://www.youtube.com/watch?v=x_CBZ4xMlm0&list=PLdYH-BkSbBMIReRp2rhAhc4gHZVGNXKUh&index=1&pp=iAQB
---
## # 12-факторное приложение на dotnet: рефакторинг, гексагональная архитектура, авторизация

Чтобы в слое бизнес-логики не нужно было каждый раз проверять, существует пользователь или нет, может ли он осуществлять ту или иную операцию, используется один их следующих подходов:

- rbac (role-based access control) see 🔗[Role-Based Access Control](#https://auth0.com/docs/manage-users/access-control/rbac#:~:text=Role%2Dbased%20access%20control%20(RBAC,assigning%20permissions%20to%20users%20individually.) (пример реализации: как обычно определенная роль имеет определенные permissions)
- abac (attribute-based access control) see 🔗[What Is Attribute-Based Access Control (ABAC)?](#https://www.okta.com/blog/2020/09/attribute-based-access-control-abac/) (пример реализации: Jira)

>[!warning]
>
>Реализация прав доступа и проверка на то, что может делать пользователь, а что не может, относиться к доменному слою


***finished on 00:27:35***

