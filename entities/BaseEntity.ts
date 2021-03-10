import 'reflect-metadata';

export type EntityTypeInstance<T> = new (...args: any[]) => T;

export class EntityFactory {

  static formPersistenceObject<T extends IEntity>(obj: Object, type: EntityTypeInstance<T>): T {
    let output = new type()
    //get an array back of the persisted properties
    const persistedProperties: string[] = Reflect.getMetadata("entity:properties", output) || [];
    // get the id propety
    const idProperty = Reflect.getMetadata("entity:id", output);
    // grab the object that is passed in (this object is what is pulled from the db in this case)
    const props = Object.keys(obj);
    //loop over the properties and populated the new instance of the class
    console.log('in form persistence obj: ')
    console.log('obj: ', obj)
    for (let prop of props) {
      console.log('prop: ', prop)
      console.log('id property: ', idProperty)
      console.log('persistedProperties: ', persistedProperties)
      if (persistedProperties.includes(prop) || prop == idProperty) {
        output[prop] = obj[prop]
      } else {
        throw new Error("Property not defined in class.")
      }
    }
    return output;
  } 
}

export interface IEntity {
  getPersistenceObject(): any;
}

export default class BaseEntity implements IEntity {
  getPersistenceObject(): any {
    let output = {};
    // same array of persisted properties
    const persistedProperties = Reflect.getMetadata("entity:properties", this);
    // get id of entity
    const idProperty = Reflect.getMetadata("entity:id", this);
    // set id 
    output[idProperty] = this[idProperty];
    // loop through all persisted properties and set those
    for (const prop of persistedProperties) {
      if (this[prop]) {
        output[prop] = this[prop];
      }
    }
    return output;
  }

}