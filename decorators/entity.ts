import "reflect-metadata";

// Entity decorator, stores the value entitiy:name into the metaData
export function entity(name: string) {
  return function (constructor: Function) {
    Reflect.defineMetadata("entity:name", name, constructor)
  }
}

// Persist Decorator: property decoraty in a class which allows us to create list of properties in a class
export function persist(target: any, propertyKey: string) {
  //add the propertied to an array of strings
  let objectProperties: string[] = Reflect.getMetadata("entity:properties", target) || [];
  if (!objectProperties.includes(propertyKey)) {
    objectProperties.push(propertyKey)
    //sends the update using definteMetaData function
    Reflect.defineMetadata("entity:properties", objectProperties, target);
  }
}

//ID decorate: Property decorator.  Using to set entity:id field
export function id(target: any, propertyKey: string) {
  Reflect.defineMetadata("entity:id", propertyKey, target)
}