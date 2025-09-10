You just finished coding your new feature, it’s great and it works!

But how do you prove that it actually works?

Time to write your unit tests!

![[Pasted image 20240718101641.png]]
Bob Code Originals

# Agenda

**I. Introduction**  
- What are unit tests in .Net?  
- Why do we have to create unit tests?  
- What unit tests tools are there in .Net?

**II. Getting Started  
**- Creating a xUnit Test project  
- NuGet Package  
- Why do unit test classes need to be public?  
- Test Method Naming Convention  
- What does the [Fact] attribute do?  
- How to build xUnit test methods?

**III. xUnit Data Annotations and Attributes  
**- Data Driven Tests with [Theory]  
- [Trait]

**IV. Mock**  
- Mock behaviour

**V. AAA: Arrange**  
- SetUp  
- Return  
- Exceptions  
- Implicit checks

**VI. AAA: Act**  
- Fixture

**VII. AAA: Assert**

**VIII. Running Test**  
- Manually  
- Automatically  
- Code Coverage  
- Debugging  
- Running Tests in Parallel

**IX. Best Practices**

**X. Documentation & Error List**

# I. Introduction

## What are unit tests in .Net?

Unit tests refer to testing “unit of works”, which basically means:

- Code that has no external dependencies (isolated)

Unit testing is a software testing methodology where individual units or components of a software application are tested in **isolation** to ensure they function correctly.

In comparison integration test 2 or more components that interact together (not isolated).

End to End Test go even further and test an app through its UI# with tools like Selenium

![](https://miro.medium.com/v2/resize:fit:512/0*PW07Ng4omOZu3V31.png)

[

## Testing in .NET - .NET

### This article gives a brief overview of testing concepts, terminology, and tools for testing in .NET.

learn.microsoft.com



](https://learn.microsoft.com/en-us/dotnet/core/testing/?source=post_page-----18ee2b919b05--------------------------------)

## Why do we have to create Unit tests?

Like do we really need to go through this? If it works with manual testing, then why even write unit tests?

![](https://miro.medium.com/v2/resize:fit:430/0*3i8L8jfudhdt_ziz)

Are there any developers who actually enjoy writing these things?

Isn’t it why we have testers?

![](https://miro.medium.com/v2/resize:fit:567/0*ffGF2DLnFbf-uEOq.jpg)

Bob Code Originals

**Prove that it works**

Sure, you can go debug mode, input some fake data and do a demo to the whole team to prove that it works.

But that’s not very time efficient, persuasive and a long term solution.

Isn’t it convenient to have all these passing tests showing to yourself and everyone else that the code works?

**Regression**

Basically, not only do you want to make sure that your current code works but also, your app is quite likely to change overtime and therefore you want to make sure that its other functionalities keep working as expected.

So that if you add or change code, the tests will always check whether the other functionalities you created before still work as they should.

**Automation**

You don’t want to manually have to manual test all the the time. That’s when tests come in handy, especially when automatically run in a pipeline!

## What unit tests tools are there in .Net?

- xUnit

![](https://miro.medium.com/v2/resize:fit:302/1*KjnQSHKiw_dHQT4H8c-TJA.png)

xUnit is a free, open-source, community-focused unit testing tool for .NET.

Its frameworks provide a framework for writing and running automated unit tests.

It is a project of the [.NET Foundation](https://dotnetfoundation.org/). xUnit.net is the latest technology for unit testing .NET apps. It is free and open source.

xUnit is now the Microsoft default and standard testing tool in Visual Studio for .Net Core.

A nice feature of xUnit is the ability to test code from

- .Net Framework
- .Net Core
- Xamarin

This blog focuses on xUnit :)

[

## Comparing xUnit.net to other frameworks

### Documentation site for the xUnit.net unit testing framework

xunit.net







](https://xunit.net/docs/comparisons?source=post_page-----18ee2b919b05--------------------------------)

[

## Unit testing C# code in .NET using dotnet test and xUnit - .NET

### Learn unit test concepts in C# and .NET through an interactive experience building a sample solution step-by-step using…

learn.microsoft.com



](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-dotnet-test?source=post_page-----18ee2b919b05--------------------------------)

![](https://miro.medium.com/v2/resize:fit:500/0*wblu0dZc6PlSWA3N.jpg)

- N Unit

[NUnit](https://nunit.org/) is a unit-testing framework for all .NET languages

- MSTest

[MSTest](https://github.com/microsoft/testfx) is the Microsoft test framework for all .NET languages

Now that we understand the key concepts, let’s create a xUnit test project!

# II. Getting Started

![](https://miro.medium.com/v2/resize:fit:598/0*jQerXOUqi-Gba_9Q.jpg)

Bob Code Originals

## Creating a xUnit Test project

![](https://miro.medium.com/v2/resize:fit:700/1*SqMLhcJES_4JUbMGFN6isg.png)

Naming the test project:

Name of project + .UnitTests

![](https://miro.medium.com/v2/resize:fit:585/1*e4rWRKIfrlSLFg-EaZlFNg.png)

Keep the global using.cs that will ensure that Xunit is used everywhere

![](https://miro.medium.com/v2/resize:fit:389/1*C5fHEXNXnWuVPP5t_E4Oxw.png)

## NuGet Package

If you create a xUnit project from VS, the package should already be added, otherwise you can manually add it

![](https://miro.medium.com/v2/resize:fit:700/1*X3zVTkx4HFfABXxvsMymvQ.png)

And you will need this package to run tests in VS: **xunit.runner.visualstudio**

![](https://miro.medium.com/v2/resize:fit:700/1*JQbd1_TcefdXKFdOF-Z6gQ.png)

Naming the file:

Name of cs file to be tested + Tests, e.g. BrandControllerTests

![](https://miro.medium.com/v2/resize:fit:424/1*zDvesIjH5yU11meK5m_QRA.png)

## Why do unit test classes need to be public?

In C#, unit tests typically need to be declared as public because they need to be accessible by the testing framework.

When you write unit tests using frameworks like NUnit, MSTest, xUnit, etc., these frameworks require that the test methods be public so that they can be discovered and executed.

## Test Method Naming Convention

First thing first, a test method needs to be named right, it should consist of three parts:

- The name of the method being tested.
- The scenario under which it’s being tested.
- The expected behaviour when the scenario is invoked.

**nameOfMethodBeingTested_Scenario_ExpectedBehaviour()**

_example, original method to be tested_

public async Task<ActionResult<IEnumerable<Brand_DTO>>> GetAllBrands()  
{  
}

_Test Method (add [Fact] on top)_

[Fact]  
public async Task GetAllBrands_ActionExecutes_CheckResultType_ReturnsBrand_DTOs()  
{  
}

Another naming convention is to use

**<MethodName>_should_<expectation>_when_<condition>**

Example: `Constructor_should_throw_when_parameters_are_null`

## **What does the [Fact] attribute do?**

- [Fact]

The [Fact] attribute declares a test method that’s run by the test runner.

Therefore it must be added on top of each test method like below

[Fact] // => [fact] will make sure that the test is picked up by the test runner  
public async Task GetAllBrands_ActionExecutes_CheckResultType_ReturnsBrand_DTOs()  
{  
}

## How to build xUnit tests? Using Moq and AAA

There are basically 4 steps into building a test:

- 1/ Mock external dependencies
- 2/ Arrange
- 3/ Act
- 4/ Assert

**1/ Mocking**

So how to deal with dependencies? Well, we don’t! We simply **simulate** them by using a framework called Mock

[

## Dealing with dependencies | Unit Testing in C#

### Most components rely on dependencies to perform their tasks. Delegating certain concerns to dependencies makes it…

docs.educationsmediagroup.com



](https://docs.educationsmediagroup.com/unit-testing-csharp/unit-testing/dealing-with-dependencies?source=post_page-----18ee2b919b05--------------------------------)

First, you will need to install the package Moq

![](https://miro.medium.com/v2/resize:fit:700/1*o3LO2cFYBSiCBLg6L0XuBA.png)

So what does Mocking do?

Let’s look at the below class

public class BrandController : ControllerBase  
{  
    private readonly IBrandService _service;  
  
    public BrandController(IBrandService service, ILogger<BrandController> logger)   
    {  
        _service = service;  
    }

You can see that it takes one external dependencies

- _service

However, a unit test should not rely on external objects.

Therefore we need to stimulate the behaviour of this object.

To do so, we will mock it, like so:

public class BrandControllerTests  
 {  
     private readonly Mock<IBrandService> _serviceMock;  
  
    public BrandControllerTests()  
     {  
         _serviceMock = new Mock<IBrandService>(MockBehavior.Strict);  
     }

![](https://miro.medium.com/v2/resize:fit:574/0*hthK5fu5OMmL1AXv.png)

[https://www.soapui.org/learn/mocking/what-is-api-mocking/](https://www.soapui.org/learn/mocking/what-is-api-mocking/)

Now what we have our simulated object, so we can use it and its methods in our test code.

This is the method we want to test

public async Task<ActionResult<Brand_DTO>> GetBrandByID(int id)  
{  
    return Ok(await _service.GetByIdAsync(id));  
}

The method GetBrandByID in the BrandController uses the _service (that we just mocked) that:

- takes as input an int
- returns an object

GetBrandByID then returns an OkResult

**2/ Arrange** takes care of arranging the Mock object so it

- calls the method passed in the class we are testing, using SetUp
- returns the right object using Return

// Arrange  
     _serviceMock.Setup(x => x.GetByIdAsync(_id))   
                .ReturnsAsync(new Brand_DTO { ID = _id });

![](https://miro.medium.com/v2/resize:fit:500/0*duyJsZiwTyseK5XM.jpg)

Bob Code Originals

**3/ Act** will actually call the method we are testing passing the mock object(s) to the class under test

// Act  
     var controller = new BrandController(_serviceMock.Object);  
     var result = await controller.GetBrandByID(_id);

**4/ Assert** is when we check whether the test returns the expected value, in our test example we expect:

- An OkResult
- That it returns a object of type Brand_DTO
- That the integer id we pass as parameter is correct

// Assert  
     var okResult = Assert.IsType<OkObjectResult>(result.Result);  
     var item = Assert.IsType<Brand_DTO>(okResult.Value);  
     Assert.Equal(_id, item.ID);

![](https://miro.medium.com/v2/resize:fit:700/0*bq82HMCRv1ucM1PE.png)

Source: [https://methodpoet.com/](https://methodpoet.com/)

And here is our complete xUnit test class!

  
public class BrandControllerTests  
 {  
     private readonly Mock<IBrandService> _serviceMock;  
  
    public BrandControllerTests()  
     {  
         _serviceMock = new Mock<IBrandService>(MockBehavior.Strict);  
     }  
  
[Fact]  
 public async Task GetByID_Returns_SingleObject()  
 {  
     // Arrange  
     _serviceMock.Setup(x => x.GetByIdAsync(_id))  
                .ReturnsAsync(new ProductModelInClubCollection_DTO { ID = _id });  
  
      // Act  
     var controller = new ProductModelInClubCollectionController(_serviceMock.Object, _loggerMock.Object, _mapperMock.Object);  
     var result = await controller.GetByID(_id);  
       
      // Assert  
     var okResult = Assert.IsType<OkObjectResult>(result.Result);  
     var item = Assert.IsType<ProductModelInClubCollection_DTO>(okResult.Value);  
     Assert.Equal(_id, item.ID);  
 }

And that’s it!

Now let’s delve deeper into each part of xUnit and look at multiple scenarios

# III. xUnit Data Annotations and Attributes

## Data Driven Tests with [Theory]

Theory enables you to add multiple inputs to the test one method.

This is called Data Driven Tests

So in the below method we are passing 3 inputs to one test method

[Theory]  
[InlineData(-1)]  
[InlineData(0)]  
[InlineData(1)]  
public void IsPrime_ValuesLessThan2_ReturnFalse(int value)  
{  
    var result = _primeService.IsPrime(value);  
    Assert.False(result, $"{value} should not be prime");  
}

![](https://miro.medium.com/v2/resize:fit:666/0*8WTOO7n4A5tN8FZ_.jpg)

Bob Code Originals

The limitation of [InlineData] is that we can only apply it to one test method.

If you wish to share input data amongst classes use the [ClassData] attribute instead

[Theory]  
[ClassData(typeof(Input))]  
public void IsPrime_ValuesLessThan2_ReturnFalse(int value)  
{  
    var result = _primeService.IsPrime(value);  
    Assert.False(result, $"{value} should not be prime");  
}

OR [MemberData]

[Theory]  
[MemberData(nameof(Input)]  
public void IsPrime_ValuesLessThan2_ReturnFalse(int value)  
{  
    var result = _primeService.IsPrime(value);  
    Assert.False(result, $"{value} should not be prime");  
}

For this you will need another class

public class Input: IEnumerable<object[]>  
{  
    public IEnumerator<object[]> GetEnumerator()  
    {  
        yield return new object[] { 1, 2, 3 };  
    }  
  
    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();  
}

[

## Creating parameterised tests in xUnit with [InlineData], [ClassData], and [MemberData]

### In this post I describe how to create parameterised tests using xUnit's [Theory], [InlineData], [ClassData], and…

andrewlock.net



](https://andrewlock.net/creating-parameterised-tests-in-xunit-with-inlinedata-classdata-and-memberdata/?source=post_page-----18ee2b919b05--------------------------------)

Alternatively you can also create your own attribute

public class Input: DataAttribute  
{  
    public override IEnumerator<object[]> GetData(MethodInfo testMethod)  
    {  
        yield return new object[] { 1, 2, 3 };  
    }  
}

Now we can use this custom attribute in our test

[Theory]  
[Input]  
public void IsPrime_ValuesLessThan2_ReturnFalse(int value)  
{  
    var result = _primeService.IsPrime(value);  
    Assert.False(result, $"{value} should not be prime");  
}

These techniques might seem cumbersome, thankfully there is another option: `TheoryData`

First we use ClassData

[Theory]  
[ClassData(typeof(Input))]  
public void IsPrime_ValuesLessThan2_ReturnFalse(int value)  
{  
    var result = _primeService.IsPrime(value);  
    Assert.False(result, $"{value} should not be prime");  
}

Then we create a `TheoryData` class that’s way easier to set-up

public class Input: TheoryData  
{  
    public Input()  
    {  
        Add(-1);  
        Add(0);  
        Add(3);  
    }  
}

[

## Creating Data-Driven Tests With xUnit

### Data-driven testing is a testing method where test data is provided through some external source. Hence it's also known…

www.milanjovanovic.tech



](https://www.milanjovanovic.tech/blog/creating-data-driven-tests-with-xunit?source=post_page-----18ee2b919b05--------------------------------)

## [Trait]

Useful for filtering and marking the type or group of tests, here:

- The trait type is category
- the category name is integration

[Fact, Trait("Category", "Integration")]  
public async Task SendInactiveMember_Should_CreateTicket()  
{  
}

This is particularly useful to differenciate between test types (unit, integration, UI…)

[Fact]  
[Trait("Category","Unit")]  
public void Test1(){  
    ...}  
  
[Fact]  
[Trait("Category","Integration")]  
public void Test2(){  
    ...}  
  
[Fact]  
[Trait("Category","UI")]  
public void Test3(){  
    ...}

When would that be useful? Well, in pipelines for example!

You can now filter tests (credits: dateo-software.de)

# Run all unit tests  
dotnet test --filter "(FullyQualifiedName!=Integration.Tests)&(FullyQualifiedName!=System.Tests)"  
  
# Run all integration tests  
dotnet test --filter "(FullyQualifiedName=Integration.Tests)&(Category=ReadyForProduction)"  

[

## Improve your pipeline maintainability with test categories in xUnit

### Today let's explore how you can improve the stability, maintainability, and readability of your CI and CD pipelines…

dateo-software.de



](https://dateo-software.de/blog/test-categories-in-xunit?source=post_page-----18ee2b919b05--------------------------------)

[

## Organizing Tests With xUnit Traits

### Once you start to have a larger number of tests it can be important to be able to break them down into different…

www.brendanconnolly.net







](https://www.brendanconnolly.net/organizing-tests-with-xunit-traits/?source=post_page-----18ee2b919b05--------------------------------)

# IV. Mock

## Mock behaviour

When creating Mocks, sometimes you want to make sure that the setup is exactly as it should, otherwise an error or exception should be thrown.

That’s when you want to use MockBehavior.Strict

If not and it doesn’t really matter whether the object behaves exactly as in real-life, such as with ILogger, then you can either keep as default or explicitly tag it as MockBehavior.Loose (the default behaviour)

public class BrandControllerTests  
 {  
     private readonly Mock<IBrandService> _serviceMock;  
     private readonly Mock<ILogger<BrandController>> _loggerMock;  
  
public BrandControllerTests()  
     {  
         _serviceMock = new Mock<IBrandService>(MockBehavior.Strict);  
         _loggerMock = new Mock<ILogger<BrandController>>(MockBehavior.Loose);  
     }

**Strict**

With strict mocks, the mock object will strictly enforce that only the expected interactions are allowed. Any unexpected calls to methods that haven’t been explicitly set up will result in a test failure.

**Loose**

Loose mocks, on the other hand, allow unexpected method calls to pass without failing the test. They are more permissive and lenient compared to strict mocks.

![](https://miro.medium.com/v2/resize:fit:617/0*FsoF06HADlgTa5k-.jpg)

Bob Code Originals

[

## Mock customization | Unit Testing in C#

### Moq has certain behaviors that might appear quite opinionated. Although these behaviors are active by default, they can…

docs.educationsmediagroup.com



](https://docs.educationsmediagroup.com/unit-testing-csharp/moq/mock-customization?source=post_page-----18ee2b919b05--------------------------------)

# V. AAA: Arrange

Remember every external dependencies Mock object?

If any is passed in your original method, you will need to arrange them, aka set them up.

The SetUp part is perhaps the most important set in your whole test! If you don’t **exactly (like exactly)** simulate the original method, with the exact same dependencies and return type, you will get this error:

_Moq.MockException : invocation failed with mock behavior Strict. All invocations on the mock must have a corresponding setup._

![](https://miro.medium.com/v2/resize:fit:500/0*Rxd_3qEwC4qRvBPq.jpg)

Bob Code Originals

Let’s look at this example, this is the original method

public async Task<ActionResult<ProductModelInClubCollection_DTO>> GetByID(int id)  
{  
    return Ok(await _service.GetByIdAsync(id));  
}

You can see that it uses one object:

- _service

The test method will need the object to be mocked, i.e. simulated

So we need to simulate the _service object to return a ClubCollectionGetModel

## **SetUp**

![](https://miro.medium.com/v2/resize:fit:666/0*7xfhhc_cRidJeEjn.jpg)

Bob Code Originals

Let’s set it up!

// Arrange  
_serviceMock.Setup(x => x.GetByIdAsync(It.Is<int>()))  
                            .ReturnsAsync(new ProductModelInClubCollection_DTO { ID = _id });

This is how we create a setup:

_objectMocked .SetUp

- (x => x.MethodUsed (Optional: the argument or type passed to the MethodUsed (e.g. It.Is<int>, or simply 1)))
- .Return (the object or type want to be returned)

Here are some examples visualised

![](https://miro.medium.com/v2/resize:fit:700/1*1mPsvDjj-FDrXRGS7Yq1lg.png)

Bob Code Originals

_See all SetUp Options in the Moq documentation below_

[

## Moq

### SetupProperty(TProperty) Method (Expression(Func))

documentation.help







](https://documentation.help/Moq/?source=post_page-----18ee2b919b05--------------------------------)

![](https://miro.medium.com/v2/resize:fit:700/1*1mD_c_aFRp_Uhnj4kyvciw.png)

[https://documentation.help/Moq/](https://documentation.help/Moq/)

[

## Results | Unit Testing in C#

### When configuring mocks, it is important to specify the return value of functions (methods that return a value) and…

docs.educationsmediagroup.com



](https://docs.educationsmediagroup.com/unit-testing-csharp/moq/results?source=post_page-----18ee2b919b05--------------------------------)

Let’s look at some parameter examples that you can pass in the SetUp Method being mocked:

- It.IsAny<int>()
- 1
- It.Is<int>()
- It.Is<int>(i => i % 2 == 0)
- It.IsInRange<int>(0, 10, Range.Inclusive)
- It.IsRegex(“[a-d]+”, RegexOptions.IgnoreCase)

Here’s a compiled list of several setup and return options!

// Any integer, any value returned  
_serviceMock.Setup(x => x.GetByIdAsync(It.IsAny<int>()))  
             .Returns(objecttobereturned)  
  
// hardcoded value  
_serviceMock.Setup(x => x.GetByIdAsync(1))  
             .Returns(objecttobereturned)  
  
// When checking for one specific value to be returned  
_serviceMock.Setup(x => x.GetByIdAsync(It.Is<int>())  
             .Returns(objecttobereturned)  
  
// Can include specific matching pattern  
_serviceMock.Setup(x => x.GetByIdAsync(It.Is<int>(i => i % 2 == 0)))  
             .Returns(objecttobereturned)  
  
// Matching ranges  
_serviceMock.Setup(x => x.GetByIdAsync(It.IsInRange<int>(0, 10, Range.Inclusive)))  
             .Returns(objecttobereturned)  
  
// Matching regex  
_serviceMock.Setup(x => x.GetByIdAsync(It.IsRegex("[a-d]+", RegexOptions.IgnoreCase)))  
             .Returns(objecttobereturned)  
  
// Matching complex condition  
_serviceMock.Setup(x => x.Method(It.Is<int>(i => i % 2 == 0 && i > 0)))  
             .Returns(objectToBeReturned);  
  
// Callback example  
_serviceMock.Setup(x => x.Method(It.IsAny<int>()))  
            .Callback<int>(value => Console.WriteLine($"Called with value: {value}"));  
  
// Throws exception  
_serviceMock.Setup(x => x.Method(It.IsAny<string>()))  
             .Throws<Exception>();  
  
// Throws exception with custom message  
_serviceMock.Setup(x => x.Method(It.IsAny<string>()))  
             .Throws(new Exception("Custom exception message"));  
  
// Sets up multiple return values, will return 'result1' on the first call, and 'result2' on subsequent calls  
_serviceMock.SetupSequence(x => x.Method(It.IsAny<int>()))  
            .Returns("result1").Returns("result2");  
  
// Setup with multiple arguments  
_serviceMock.Setup(x => x.MethodWithMultipleArgs(It.IsAny<int>(), It.IsAny<string>()))  
            .Returns(objectToBeReturned);  
  
// Setup with multiple arguments and specific conditions  
_serviceMock.Setup(x => x.MethodWithMultipleArgs(It.Is<int>(i => i > 0), It.Is<string>(s => s.Length > 5)))  
            .Returns(objectToBeReturned);  
  
// Setup with multiple arguments and specific conditions for one argument and any value for the other  
_serviceMock.Setup(x => x.MethodWithMultipleArgs(It.Is<int>(i => i > 0), It.IsAny<string>()))  
            .Returns(objectToBeReturned);  
  
// Setup with custom matching using Match<T> class  
_serviceMock.Setup(x => x.MethodWithCustomMatcher(Match.Create<int>(i => i % 2 == 0)))  
            .Returns(objectToBeReturned);  
  
// Setup with custom return value based on argument values  
_serviceMock.Setup(x => x.MethodWithCustomReturnValue(It.IsAny<int>()))  
            .Returns((int arg) => arg % 2 == 0 ? "Even" : "Odd");  
  
// Setup with asynchronous return value using Task.FromResult  
_serviceMock.Setup(x => x.AsyncMethod())  
            .ReturnsAsync(Task.FromResult(objectToBeReturned));  
  
// Setup with asynchronous return value using Task.FromResult with delay  
_serviceMock.Setup(x => x.AsyncMethodWithDelay()).ReturnsAsync(async () =>  
{  
    await Task.Delay(100);  
    return objectToBeReturned;  
});  
  
// Setup with asynchronous return value using async lambda  
_serviceMock.Setup(async x => await x.AsyncMethod())  
            .Returns(objectToBeReturned);  
  
// Setup with throwing an exception asynchronously  
_serviceMock.Setup(x => x.AsyncMethod())  
            .ThrowsAsync(new Exception("Async exception"));  
  
// Setup with custom behavior using a function  
_serviceMock.Setup(x => x.MethodWithCustomBehavior(It.IsAny<int>()))  
            .Returns((int arg) =>  
{  
    if (arg < 0)  
        throw new ArgumentException("Argument cannot be negative");  
    return objectToBeReturned;  
});

[

## Moq: How to specify the argument with detail condition when mock a method?

### This is my own note to remember how we can pass argument to mocked method in various ways. … Tagged with unittest…

dev.to



](https://dev.to/kenakamu/moq-how-to-specify-the-argument-with-detail-condition-when-mock-a-method-41lo?source=post_page-----18ee2b919b05--------------------------------)

## Return

**Returns or ReturnsAsync** and The Object(s) you want to return

// Returns  
_serviceMock.Setup(x => x.GetByIdAsync(1).Returns(objecttobereturned)  
  
// Returns Async  
_serviceMock.Setup(x => x.GetByIdAsync(_id)).ReturnsAsync(objecttobereturned)  
  
// Or use Task.FromResult instead of ReturnsAsync  
_serviceMock.Setup(x => x.GetByIdAsync(1).Returns(Task.FromResult(objecttobereturned))

![](https://miro.medium.com/v2/resize:fit:500/0*HbwAsYaWA7cZwkUJ.jpg)

Bob Code Originals

**Return for void/task**

What about methods that actually don’t return anything?

See this example, we actually just perform a Task and only return an Ok (ActionResult), but the _service doesn’t return anything

public async Task<IActionResult> Delete(int id)  
{  
    await _service.DeleteAsync(id);  
    return Ok();  
}

In this case we just return Task.CompletedTask

// For tasks: Task.CompletedTask  
_serviceMock.Setup(x => x.DeleteAsync(_id)).Returns(Task.CompletedTask);  
  
// For void: Callback  
_serviceMock.Setup(x => x.DeleteAsync(_id)).Callback(() => { });

[

## Callbacks | Unit Testing in C#

### A powerful capability of Moq is to attach custom code to configured methods and properties' getters and setters. This…

docs.educationsmediagroup.com



](https://docs.educationsmediagroup.com/unit-testing-csharp/moq/callbacks?source=post_page-----18ee2b919b05--------------------------------)

**Return for null**

What about methods that should return null (e.g. for testing null exceptions)?

// null string   
mock.Setup(p => p.Property).Returns(null as string);  
  
// null object  
_mock.Setup(p => p.GetProductmodel(id).ReturnsAsync((ProductmodelResponseModel)null);

[

## Results | Unit Testing in C#

### When configuring mocks, it is important to specify the return value of functions (methods that return a value) and…

docs.educationsmediagroup.com



](https://docs.educationsmediagroup.com/unit-testing-csharp/moq/results?source=post_page-----18ee2b919b05--------------------------------)

**Throwing exception**

Sometime a method block throws an exception, so instead of returns we use .Throws

  
mock.Setup(p => p.DoSomething())  
    .Throws(new Exception("My custom exception"));  
  
// Async  
mock.Setup(p => p.DoSomething())  
    .ThrowsAsync(new Exception("My custom exception"));

[

## Exceptions | Unit Testing in C#

### One of the most common tasks that were solved with callbacks is throwing an exception when a certain method is invoked…

docs.educationsmediagroup.com



](https://docs.educationsmediagroup.com/unit-testing-csharp/moq/exceptions?source=post_page-----18ee2b919b05--------------------------------)

[

## Unit Testing Exceptions in C#

### Using C#, .NET Core, and xUnit, we will dive into how to unit test exceptions using xUnit (and other testing frameworks…

chadgolden.com



](https://chadgolden.com/blog/unit-testing-exceptions-in-c-sharp?source=post_page-----18ee2b919b05--------------------------------)

**Using methods from the base class**

What if your class uses a base, like so

public class BrandInClubAssortmentService : GenericService<BrandInClubAssortment, BrandInClubAssortment_DTO>, IBrandInClubAssortmentService  
{  
    private readonly IProductAndPricingAPIClient _productAndPricingAPIClient;  
  
    public BrandInClubAssortmentService(    IProductAndPricingAPIClient productAndPricingAPIClient,   
    IMapper mapper)   
    : base(mapper)  
    {  
        _productAndPricingAPIClient = productAndPricingAPIClient;  
    }

You’d need to Mock the mapper and logger to ensure good functioning of the class, and also pass them as Mock.Object in your class constructor.

var service = new BrandInClubAssortmentService(  
    ProductAndPricingAPIClientMock.Object,  
    MapperMock.Object,  
);

Otherwise you are quite likely to encounter the below exception

_Moq.MockException : IMapperBase.Map<BrandInClubAssortment>(BrandInClubAssortment_DTO) invocation failed with mock behavior Strict.  
All invocations on the mock must have a corresponding setup._

What if, even though you have set-up the base mock objects correctly, you still get this error?

If you look at the documentation, then you will see the recommendation to use .CallBase()

mock.Setup(p => p.Greet()).CallBase();

[

## Base class | Unit Testing in C#

### Especially in older codebases, services and components can be part of a deep hierarchy of classes. Often, belonging to…

docs.educationsmediagroup.com



](https://docs.educationsmediagroup.com/unit-testing-csharp/moq/base-class?source=post_page-----18ee2b919b05--------------------------------)

However, this only works if the mock is created from a class, not an interface, and the method being called is not abstract. So, this won’t work

_fixture.MapperMock.Setup(x => x.Map<BrandInClubAssortment>(It.IsAny<BrandInClubAssortment_DTO>())).CallBase();

If the Mock is as follows

MapperMock = new Mock<IMapper>(MockBehavior.Strict);

The solution is to set it up as a normal mock

  
_fixture.MapperMock.Setup(x => x.Map<BrandInClubAssortment>(It.IsAny<BrandInClubAssortment_DTO>()))  
                   .Returns(new BrandInClubAssortment());

## Implicit checks

The above is for explicit verification aka, we pass a method and expect a hardcoded object, the other way of doing this is just checking whether the method works regardless of what it returns using:

- Verifiable
- VerifyAll

// Implicit uses .Verifiable  
_serviceMock.Setup(p => p.GetByIdAsync(It.IsAny<string>())).Verifiable();  
  
// In the Assert part we use  
_serviceMock.VerifyAll();  
  
// OR to check multiple mocks  
Mock.Verify(_serviceMock1, _serviceMock2);  

[

## Verifications | Unit Testing in C#

### When writing unit tests for components consuming dependencies, it’s important to make sure the right calls were invoked…

docs.educationsmediagroup.com



](https://docs.educationsmediagroup.com/unit-testing-csharp/moq/verifications?source=post_page-----18ee2b919b05--------------------------------)

# VI. AAA: Act

Once you have all dependencies setup, now it’s time to actually instantiate your class that you are testing

![](https://miro.medium.com/v2/resize:fit:360/0*Uy46ZfxpTtSQrz1f.gif)

Bob Code Originals

The trick is to pass the objects of the Mocks instead of the external dependencies to your class.

// Act  
  
# First we instantiate the class with Mock objects  
var controller = new ProductModelInClubCollectionController(_serviceMock.Object);  
       
# Then we actually call the method we want to test  
var result = await controller.GetAll();

Finally, it’s time to check if the method returns what we expect, we do this in the Assert

## Fixture

**What is the IFixture class in c# and how to use it with xUnit?**

Since you will most likely end-up with a lot of tests, instantiating a new object for each test method might not be the best in terms of resources.

One potential solution would be to instantiate your object in the constructor

public class ProductModelInClubCollectionServiceTests  
{  
    private readonly Mock<IGenericRepository<ClubCollection>> _ccRepositoryMock;  
  
    private readonly ProductModelInClubCollectionService _service;  
  
    public ProductModelInClubCollectionServiceTests()  
    {  
        _ccRepositoryMock = new Mock<IGenericRepository<ClubCollection>>(MockBehavior.Strict);  
  
        _service = new ProductModelInClubCollectionService(_ccRepositoryMock.ObjectcRepositoryMock.Object);  
    }

Even if you pass the object (example above “controller”) in the constructor of the test class, which will help in terms of code size, the amount of objects created will be the same.

This calls for the need of another solution, which is the fixture!

However, most documentation provides examples that don’t include any external objects like so

public class StackTests : IDisposable  
{  
    Stack<int> stack;  
  
    public StackTests()  
    {  
        stack = new Stack<int>();  
    }  
  
    public void Dispose()  
    {  
        stack.Dispose();  
    }  
  
    [Fact]  
    public void WithNoItems_CountShouldReturnZero()  
    {  
        var count = stack.Count;  
  
        Assert.Equal(0, count);  
    }

In real life scenarios you’re quite likely to have several mock.Object within your constructor!

So let’s see how to go about it :)

The trick is to add the Mocks in the Fixture

public class BrandInClubAssortmentServiceFixture : IDisposable  
{  
    public Mock<IGenericRepository<ClubCollection>> ClubCollectionRepositoryMock { get; }  
  
    public BrandInClubAssortmentService brandInClubAssortmentFixture { get; }  
  
    public BrandInClubAssortmentServiceFixture()  
    {  
        ClubCollectionRepositoryMock = new Mock<IGenericRepository<ClubCollection>>(MockBehavior.Strict);  
  
        var service = new BrandInClubAssortmentService(  
            ClubCollectionRepositoryMock.Object,  
        );  
  
        brandInClubAssortmentFixture = service;  
    }  
  
    public void Dispose()  
    {  
         
    }  
}

Yes as you can see above you need to add all the mock manually, you might think that it is duplicating the original Mock in your test class but let’s see what comes next ;)

Let’s consider the original code

 [Fact]  
 public async Task AddAsync_WhenBrandDoesNotExist_ThrowsPlutusBusinessRuleViolationException()  
 {  
     // Arrange  
     var service = new BrandInClubAssortmentService(_ccRepositoryMock.Object);  
     var dto = new BrandInClubAssortment_DTO { ClubCollectionID = 1, BrandName = "brand" };  
     _ccRepositoryMock.Setup(x => x.GetByIdAsync(It.IsAny<int>())).ReturnsAsync(new ClubCollection());  
  
     // Act  
     async Task Act() => await service.AddAsync(dto);  
  
     // Assert  
     await Assert.ThrowsAsync<PlutusBusinessRuleViolationException>(Act);  
 }

Now, we need to add the fixture to our code

[Fact]  
public async Task AddAsync_WhenBrandDoesNotExist_ThrowsPlutusBusinessRuleViolationException()  
{  
    // Arrange  
    var dto = new BrandInClubAssortment_DTO { ClubCollectionID = 1, BrandName = "brand" };  
    _fixture.ClubCollectionRepositoryMock.Setup(x => x.GetByIdAsync(It.IsAny<int>())).ReturnsAsync(new ClubCollection());  
    _fixture.ProductAndPricingAPIClientMock.Setup(x => x.GetBrand(It.IsAny<string>())).ReturnsAsync((BrandResponseModel)null);  
  
    // Act  
    async Task Act() => await _fixture.brandInClubAssortmentFixture.AddAsync(dto);  
  
    // Assert  
    await Assert.ThrowsAsync<PlutusBusinessRuleViolationException>(Act);  
}

We now set up the fixture Mocks and then we use the _fixture to directly use the method.

So in the test constructor, we actually don’t need any Mock anymore!

Initially we had this constructor for the test

    public class BrandInClubAssortmentServiceTests : IClassFixture<BrandInClubAssortmentServiceTests.BrandInClubAssortmentServiceFixture>  
    {  
        private readonly Mock<IGenericRepository<ClubCollection>> _ccRepositoryMock;  
   
        private readonly BrandInClubAssortmentServiceFixture _fixture;  
  
        public BrandInClubAssortmentServiceTests(BrandInClubAssortmentServiceFixture fixture)  
        {  
            _ccRepositoryMock = new Mock<IGenericRepository<ClubCollection>>(MockBehavior.Strict);  
  
            _fixture = fixture;  
        }

But now we can just keep the _fixture :)

    public class BrandInClubAssortmentServiceTests : IClassFixture<BrandInClubAssortmentServiceTests.BrandInClubAssortmentServiceFixture>  
    {  
        private readonly BrandInClubAssortmentServiceFixture _fixture;  
  
        public BrandInClubAssortmentServiceTests(BrandInClubAssortmentServiceFixture fixture)  
        {  
            _fixture = fixture;  
        }

**Using Fixture amongst several classes**

Now, let’s image that several of our classes actually use the _fixture.

What we would need to do is:

#1 Add the [Collection] attribute to all classes that use the _fixture

_You can actually remove the following! : IClassFixture<BrandInClubAssortmentServiceTests.BrandInClubAssortmentServiceFixture> as_ [Collection] _is now enough to use Fixture_

[Collection("ServiceCollectionName")]  
public class BrandInClubAssortmentServiceTests  
    {  
        private readonly BrandInClubAssortmentServiceFixture _fixture;  
  
        public BrandInClubAssortmentServiceTests(BrandInClubAssortmentServiceFixture fixture)  
        {  
            _fixture = fixture;  
        }

#2 Create a collection class that

- Has the attribute[CollectionDefinition] with the matching name in the other classes
- Inherits from ICollectionFixture<TheNameOfYourFixture>

[CollectionDefinition("BrandInClubAssortmentServiceTests")]  
public class BrandInClubAssortmentServiceCollection : ICollectionFixture<BrandInClubAssortmentServiceFixture>  
{  
}

[

## Shared Context between Tests

### Documentation site for the xUnit.net unit testing framework

xunit.net







](https://xunit.net/docs/shared-context?source=post_page-----18ee2b919b05--------------------------------)

Whether fixture is a feature you want to use is up to you.

I believe there are certain advantages of using the Fixture feature:

- Object Management:

xUnit.net creates a new instance of the test class for every test. When using a class fixture, xUnit.net will ensure that the fixture instance will be created before any of the tests have run, and once all the tests have finished, it will clean up the fixture object by calling `Dispose`, if present.

- Code Reusability:

Set up your object once and reuse it everywhere in your test classes

[

## Shared Context between Tests

### Documentation site for the xUnit.net unit testing framework

xunit.net







](https://xunit.net/docs/shared-context?source=post_page-----18ee2b919b05--------------------------------)

[

## XUnit - Part 5: Share Test Context With IClassFixture and ICollectionFixture - Hamid Mosalla

### This post is another post in xUnit Series. We see how we can use IClassFixture and ICollectionFixture to share test…

hamidmosalla.com







](https://hamidmosalla.com/2020/02/02/xunit-part-5-share-test-context-with-iclassfixture-and-icollectionfixture/?source=post_page-----18ee2b919b05--------------------------------)

[

## Harnessing Class Fixtures in xUnit

### As developers navigating the realm of unit testing with xUnit, one of the valuable tools in our... Tagged with dotnet…

dev.to



](https://dev.to/tkarropoulos/harnessing-class-fixtures-in-xunit-3cij?source=post_page-----18ee2b919b05--------------------------------)

# 7. Assert

In assert we check whether the test performs as it should.

This is a critical step as there are many things we can check, this where you want to cover all the paths possible.

Here are some examples

- Check whether the result returns anything (e.g. notnull or null)
- Check whether the result returns the right values, types and amount of values
- Check whether the methods used to come to the result have been called

![](https://miro.medium.com/v2/resize:fit:700/0*A2xtCnBcFRxhAxtb.jpg)

**Single Object**

// Result   
Assert.IsType<OkObjectResult>(result.Result);  
  
// Type  
Assert.IsType<ProductModelInClubCollection_DTO>(okResult.Value);  
  
Assert.IsType(typeof(testingclass), actualClass);  
Assert.IsType<MyClass>(actualClass);  
  
// Value: .Equal(expected, actual) OR .NotEqual(expected, actual)  
Assert.Equal(_id, item.ID);  
  
// Null/NotNull  
Assert.NotNull(item.ID);  
  
// False/True  
Assert.False(string.IsNullOrEmpty(result.ExpectedString);  
  
// Void  
loginServiceMock.Verify(x => x.Logout(), Times.Once);  
  
// Matches(expected, actual)  
Assert.Matches("ExpectedString", result.ExpectedString);

**Strings**

// Specific assertion  
Assert.Equal("<strong>abc</strong>", result, ignoreCase: true);  
  
// More general  
Assert.StartsWith("<strong>", result, StringComparison.OrdinalIgnoreCase);  
Assert.EndsWith("<strong>", result);  
Assert.Contains("abc", result, StringComparison.OrdinalIgnoreCase);

**List/IEnumerable**

 // Result Type  
 var okResult = Assert.IsType<OkObjectResult>(result.Result);  
  
// Values  
 var items = Assert.IsAssignableFrom<IEnumerable<ProductModelInClubCollection_DTO>>(okResult.Value);              
  
// Count  
 Assert.Equal(3, items.Count());  
  
// Properties   
 Assert.Equal(1, items.ElementAt(0).ID);  
 Assert.Equal(2, items.ElementAt(1).ID);  
 Assert.Equal(3, items.ElementAt(2).ID);  
  
// Contains/ DoesNotContain  
Assert.Contains(expectedItem, result);  
  
// All  
Assert.All(collection, item => Assert.NotNull(item))  
  
// Equal  
Assert.Equal(expectedCollection, actualCollection)

![](https://miro.medium.com/v2/resize:fit:700/1*KfGFQryF8-m4crTYHcD6ng.png)

**Range**

// InRange  
Assert.InRange(customer.Age, 25, 40)

**Error Messages**

// Bad Request  
var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);  
Assert.Equal("ProductModelId should be in the format '123456'", badRequestResult.Value);

**Interface implementations**

var items = Assert.IsAssignableFrom<IYourInterface>(okResult.Value);

**Exceptions**

// Throw exception  
Assert.Throws<DivideByZeroException>(result);  
  
Assert.Throws<ArgumentException>( ()=> customer.GetOrdersByName(null));   
  
// Check exception message  
Assert.Equal("Hello", exception.Message);

Check whether mock methods were called, using VerifyAll() and VerifyNoOtherCalls()

  
_objectMock.VerifyAll();  
_objectMock.VerifyNoOtherCalls();  

1. `_objectMock.VerifyAll()`

This method verifies that all expected interactions with the mocked object have occurred.

In other words, it ensures that all the methods that were set up with expectations (such as `Setup` calls in Moq) have been called during the test. If any of the expected interactions did not occur, this method typically throws an exception, indicating a test failure.

2. `_objectMock.VerifyNoOtherCalls()`

This method verifies that there were no additional unexpected calls made to the mocked object beyond those explicitly set up with expectations.

This may sound irrelevant but it is not. Other calls can simply cause side effects which is often the main cause of production issues

It's used to ensure that the test is not calling any methods on the mocked object that it shouldn't be. If there are unexpected calls, this method also typically throws an exception, indicating a test failure.

**Complete Assert List**

using Xunit;  
using System;  
  
public class MyTests  
{  
    [Fact]  
    public void EqualityAssertions()  
    {  
        // Equality Assertions  
        Assert.Equal(expected, actual);  
        Assert.NotEqual(notExpected, actual);  
        Assert.StrictEqual(expected, actual);  
        Assert.NotStrictEqual(notExpected, actual);  
    }  
  
    [Fact]  
    public void NullityAssertions()  
    {  
        // Nullity Assertions  
        Assert.Null(obj);  
        Assert.NotNull(obj);  
    }  
  
    [Fact]  
    public void BooleanAssertions()  
    {  
        // Boolean Assertions  
        Assert.True(condition);  
        Assert.False(condition);  
    }  
  
    [Fact]  
    public void TypeAssertions()  
    {  
        // Type Assertions  
        Assert.IsType(expectedType, obj);  
        Assert.IsNotType(unexpectedType, obj);  
        Assert.IsAssignableFrom(baseType, obj);  
    }  
  
    [Fact]  
    public void ComparisonAssertions()  
    {  
        // Comparison Assertions  
        Assert.InRange(value, low, high);  
        Assert.NotInRange(value, low, high);  
    }  
  
    [Fact]  
    public void CollectionAssertions()  
    {  
        // Collection Assertions  
        Assert.Contains(expected, collection);  
        Assert.DoesNotContain(unexpected, collection);  
        Assert.Empty(collection);  
        Assert.NotEmpty(collection);  
        Assert.Single(collection);  
        Assert.All(collection, condition);  
    }  
  
    [Fact]  
    public void ExceptionAssertions()  
    {  
        // Exception Assertions  
        Assert.Throws<Exception>(() => SomeMethod());  
        Assert.ThrowsAny<Exception>(() => SomeMethod());  
        Assert.ThrowsAsync<Exception>(async () => await SomeMethodAsync());  
        Assert.ThrowsAnyAsync<Exception>(async () => await SomeMethodAsync());  
        Assert.DoesNotThrow(() => SomeMethod());  
    }  
  
    [Fact]  
    public void StringAssertions()  
    {  
        // String Assertions  
        Assert.StartsWith(expectedSubString, actual);  
        Assert.EndsWith(expectedSubString, actual);  
        Assert.Contains(subString, actual);  
        Assert.Matches(pattern, actual);  
        Assert.DoesNotMatch(pattern, actual);  
    }  
  
    [Fact]  
    public void MiscellaneousAssertions()  
    {  
        // Miscellaneous Assertions  
        Assert.Same(expected, actual);  
        Assert.NotSame(notExpected, actual);  
        Assert.Empty(strOrCollection);  
        Assert.NotEmpty(strOrCollection);  
        Assert.Equal<T>(expected, actual);  
    }  
}

# 8. Running Test

**Understand how xUnit runs your test methods**

Upon clicking run tests, xUnit will create an instance of the test class for every method test being executed.

## Manually

Use the command line

dotnet test

Or right click your test class and click “run tests”

![](https://miro.medium.com/v2/resize:fit:461/1*a0iECjy_YbeROOU3jfPyXw.png)

A nice GUI (Test explorer) with all your tests will appear

![](https://miro.medium.com/v2/resize:fit:700/1*vR8-zb-u2_WQ7lYZDSpZew.png)

You can also access this GUI using the Test icon on the top in VS

![](https://miro.medium.com/v2/resize:fit:391/1*UiD2KNoB_3rCHS0Db-Jycg.png)

## Automatically with a pipeline

Now, once you have finished running your tests locally, you want to make sure that any time new code is being pushed, that the tests are always being run.

You will want to do this automatically, and this where pipelines shine!

I suggest you check my other blog on how to do that :)

[

## .NET Build YAML Pipeline with Code Coverage Report in Azure DevOps

### This article shows how to create a .net build pipeline in YAML that also creates a code coverage report in Azure DevOps

medium.com



](https://medium.com/@codebob75/net-build-yaml-pipeline-with-code-coverage-report-in-azure-devops-63f723adeb7d?source=post_page-----18ee2b919b05--------------------------------)

## What is code coverage?

So you’ve run all your tests and you think, job’s done!

Well, not so fast, first thing you want to ensure is that the tests cover most of your code.

This is referred to as code coverage.

A code coverage report will give you how much percent of your code has been tested, whilst 100% is nice, a typical project aims for 80% code coverage

[

## Use code coverage for unit testing — .NET

### Learn how to use the code coverage capabilities for .NET unit tests.

learn.microsoft.com



](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-code-coverage?tabs=windows&source=post_page-----18ee2b919b05--------------------------------)

Code Coverage is available through Coverlet

![](https://miro.medium.com/v2/resize:fit:700/0*EUD3DaQ3R2c8r2DG)

Coverlet is a free and open-source tool, to use it install the following SDK to your test project

![](https://miro.medium.com/v2/resize:fit:690/1*yX9Hh3ck0LhfkK8FuHpKbg.png)

It should come by default with your xUnit project

In the command line in your test project run

dotnet test /p:CollectCoverage=true

You will then receive the following report

![](https://miro.medium.com/v2/resize:fit:700/1*i9b7ql8VpA9jksQeW_QYsA.png)

Again this is manual and I recommend using the test coverage in a pipeline as mentioned above in my other blog!

[

## GitHub - coverlet-coverage/coverlet: Cross platform code coverage for .NET

### Cross platform code coverage for .NET. Contribute to coverlet-coverage/coverlet development by creating an account on…

github.com



](https://github.com/coverlet-coverage/coverlet?source=post_page-----18ee2b919b05--------------------------------)

[

## Determine code testing coverage — Visual Studio (Windows)

### Learn how to use the code coverage feature of Visual Studio to determine what proportion of your project code is being…

learn.microsoft.com



](https://learn.microsoft.com/en-us/visualstudio/test/using-code-coverage-to-determine-how-much-code-is-being-tested?view=vs-2022&tabs=csharp&source=post_page-----18ee2b919b05--------------------------------)

## Debugging Tests

Just as any normal code, one can actually debug your test, which is really useful to understand what input, argument or any setup that is missing.

You can do so manually by setting up a breakpoint and then selecting the Debug button

![](https://miro.medium.com/v2/resize:fit:700/1*KuJIKFWfPTHHTB_FM3dxng.png)

Note that you will get into the class that is being tested once you instantiate the class object with the Mock objects (in the ACT phase)

Press F11 and you will land in the tested class

![](https://miro.medium.com/v2/resize:fit:1000/1*uaNtpQ9INM7UDgjTxU4-MQ.png)

## Running Tests in Parallel

_Please have a look at the section on Fixtures and Collections_

xUnit assumes that every test class is its own category, in turns it runs each test category in parallel (i.e. using a diferrent thread).

That is unless we have the [Collection] attribute is applied to classes, which will run these tests in a sequential manner.

Understanding this, it is good practice to break-down tests into multiples test classes so that xUnit can treat them as separate categories and therefore run them in parallel.

However, if some tests should be run sequentially, then simply apply the [Collection] attribute.

As an example, Test1 and Test2 will run sequentially

public class TestClass1  
{  
    [Fact]  
    public void Test1()  
    {  
        Thread.Sleep(3000);  
    }  
  
    [Fact]  
    public void Test2()  
    {  
        Thread.Sleep(5000);  
    }  
}

Test1 and Test2 will run in parallel

public class TestClass1  
{  
    [Fact]  
    public void Test1()  
    {  
        Thread.Sleep(3000);  
    }  
}  
  
public class TestClass2  
{  
    [Fact]  
    public void Test2()  
    {  
        Thread.Sleep(5000);  
    }  
}

Test1 and Test2 will run sequentially

[Collection("Our Test Collection #1")]  
public class TestClass1  
{  
    [Fact]  
    public void Test1()  
    {  
        Thread.Sleep(3000);  
    }  
}  
  
[Collection("Our Test Collection #1")]  
public class TestClass2  
{  
    [Fact]  
    public void Test2()  
    {  
        Thread.Sleep(5000);  
    }  
}

[

## Controlling the Serial and Parallel Test on XUnit

### My Project requires both Serial and Parallel test execution on a project. I’d like to know how to handle this…

tsuyoshiushio.medium.com



](https://tsuyoshiushio.medium.com/controlling-the-serial-and-parallel-test-on-xunit-6174326da196?source=post_page-----18ee2b919b05--------------------------------)

[

## XUnit - Part 4: Parallelism and Custom Test Collections - Hamid Mosalla

### In this post, I'm going explain how we can use xUnit Custom Test Collections to control how the tests are executed in…

hamidmosalla.com



](https://hamidmosalla.com/2020/01/26/xunit-part-4-parallelism-and-custom-test-collections/?source=post_page-----18ee2b919b05--------------------------------)

[

## Running Tests in Parallel

### Documentation site for the xUnit.net unit testing framework

xunit.net







](https://xunit.net/docs/running-tests-in-parallel?source=post_page-----18ee2b919b05--------------------------------)

# IX. Best practices for unit tests

- Keep it simple

If your test takes more time than writing the feature, it means that perhaps the feature needs some refactoring.

It should test only one component or method, not more!

- Check all possible paths

Ensure that you have tested all possible inputs, exceptions and loops within the tested method.

Check happy path but also illegal arguments (i.e. nulls, out-of-range…)

- Use Mocking to remove external dependencies

You should not have any dependencies on external objects in your tests, use Mock to simulate them

- Fast: make use of parallelism

Projects will quickly add more and more unit tests, therefore they need to remain lightweight to run fast and not bug down the application.

One way of doing so is by creating more classes so xUnit can make use of parallelism

- Minimal

Don’t make too many assertions in one unit test, ideally you’d want one assert per test class

- Meet code coverage target

A typical project aims for 80% code coverage

- Use Fixture

Reuse your test object as much as possible using Fixtures

- Use Data-driven test

Create fewer tests and test all your path in one test

- Follow the AAA Model

Keep things easy to read, to recreate and to code!

![](https://miro.medium.com/v2/resize:fit:697/0*ZYnTRUyBKHOo_cd4.jpg)

Bob Code Originals

[

## Best practices for writing unit tests - .NET

### Learn best practices for writing unit tests that drive code quality and resilience for .NET Core and .NET Standard…

learn.microsoft.com



](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices?source=post_page-----18ee2b919b05--------------------------------)

[

## Qualities of a good unit test | Unit Testing in C#

### A unit test should be focused on testing a single component, often referred to as "system under test" or SUT. At the…

docs.educationsmediagroup.com



](https://docs.educationsmediagroup.com/unit-testing-csharp/unit-testing/qualities-of-a-good-unit-test?source=post_page-----18ee2b919b05--------------------------------)

# X. Documentation & Error List

Moq.MockException : IMapperBase.Map<BrandInClubAssortment>(BrandInClubAssortment_DTO) invocation failed with mock behavior Strict.  
All invocations on the mock must have a corresponding setup.

**Solution**

mapper needs to be mapped for both directions!

_fixture.MapperMock.Setup(x => x.Map<BrandInClubAssortment>(It.IsAny<BrandInClubAssortment_DTO>()))  
       .Returns((BrandInClubAssortment_DTO source) => new BrandInClubAssortment  
       {  
           ClubCollectionID = source.ClubCollectionID,  
           BrandName = source.BrandName,  
           ID = source.ID  
       });  
  
_fixture.MapperMock.Setup(x => x.Map<BrandInClubAssortment_DTO>(It.IsAny<BrandInClubAssortment>()))  
                   .Returns((BrandInClubAssortment source) => new BrandInClubAssortment_DTO  
                   {  
                       ClubCollectionID = source.ClubCollectionID,  
                       BrandName = source.BrandName,  
                       ID = source.ID  
                   });

[

## Unit testing in C# | Unit Testing in C#

### Software systems are complex creatures. They are composed of many small components working together to accomplish a…

docs.educationsmediagroup.com



](https://docs.educationsmediagroup.com/unit-testing-csharp?source=post_page-----18ee2b919b05--------------------------------)

[

## A Comprehensive Guide to Implementing xUnit Tests in C# .NET

### Mastering Test-Driven Development with xUnit: A Definitive Guide for C# .NET Developers

medium.com



](https://medium.com/bina-nusantara-it-division/a-comprehensive-guide-to-implementing-xunit-tests-in-c-net-b2eea43b48b?source=post_page-----18ee2b919b05--------------------------------)

[

## Writing Unit Tests in .NET Core C# using XUnit and Mocking Dependencies with FakeItEasy

### Unit testing is a crucial part of software development. It helps to ensure that the code is correct, reliable and…

medium.com



](https://medium.com/@susithapb/writing-unit-tests-in-net-core-c-using-xunit-and-mocking-dependencies-with-fakeiteasy-5e522133c3ae?source=post_page-----18ee2b919b05--------------------------------)

[

## Unit Test Your C# Code Easily with xUnit and TDD

### This article demonstrates how you can unit test your C# code very easily with today's latest testing technology, the…

chadgolden.com



](https://chadgolden.com/blog/unit-test-your-c-sharp-code-easily-with-xunit?source=post_page-----18ee2b919b05--------------------------------)

[

## The Power of Callbacks in Unit Testing with Moq

### In the realm of programming, every little element we employ has a significant impact on the quality... Tagged with…

dev.to



](https://dev.to/petermilovcik/the-power-of-callbacks-in-unit-testing-with-moq-159c?source=post_page-----18ee2b919b05--------------------------------)

[

## XUnit Archives - Hamid Mosalla

### This post is about writing integration tests and TestContainers. As you might know writing integration tests against…

hamidmosalla.com



](https://hamidmosalla.com/category/xunit/?source=post_page-----18ee2b919b05--------------------------------)

[

## Quick glance at Moq | Unit Testing in C#

### Moq is a mocking framework built to facilitate the testing of components with dependencies. As shown earlier, dealing…

docs.educationsmediagroup.com



](https://docs.educationsmediagroup.com/unit-testing-csharp/moq/quick-glance-at-moq?source=post_page-----18ee2b919b05--------------------------------)

[

## Best practices for writing unit tests — .NET

### Learn best practices for writing unit tests that drive code quality and resilience for .NET Core and .NET Standard…

learn.microsoft.com

  




](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices?source=post_page-----18ee2b919b05--------------------------------)