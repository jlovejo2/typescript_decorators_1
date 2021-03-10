//implementing class decorator factory
//know this is a factory because of function within a function
function logClass(message: string): ClassDecorator {
  console.log(`${message} evaluated`);
  return function (constructor: Function): void {
    console.log(`${message} called`)
  }
}

//decorator factory for property decorator
function logProperty(message: string): PropertyDecorator {
  console.log(`${message} evaluated`);
  return function (target: Object, propertyKey: string): void {
    console.log(`${message} called`);
  }
}

// decorator factor for method decorator
function logMethod(message: string): MethodDecorator {
  console.log(`${message} evaluated`);
  return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor ): void {
    console.log(`${message} called`);
  }
}

// decorator factory for parameter decorator
function logParameter(message: string): ParameterDecorator {
  console.log(`${message} evaluated`);
  return function (target: Object, propertyKey: string, parameterIndex: number ): void {
    console.log(`${message} called`);
  }
}

@logClass("Class Decorator")
class Person {

  private _directReports: Person[]

  @logProperty("Property Decorator")
  public emailAddress: string

  constructor(public frstName: string, public lastName: string) {
    this._directReports = [];
  }

  @logMethod("Method Decorator")
  @logMethod("Method Decorator 2")
  public addDirectReport(@logParameter("Parameter Decorator") person: Person) {
    this._directReports.push(person);
  }

}

const person = new Person("David", "Tucker")