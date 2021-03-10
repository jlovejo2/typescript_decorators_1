import 'reflect-metadata';

export type EntityTypeInstance<T> = new (...args: any[]) => T;

export class EntityFactory {

  static formPersistenceObject<T extends IEntity>(obj: Object, type: EntityTypeInstance<T>): T {
    //TODO: implement
    return {} as T;
  }
}

export interface IEntity {
  getPersistenceObject(): any;
}

export default class BaseEntity implements IEntity {
  getPersistenceObject(): any {
    //TODO: implement
    let output = {};
    return output;
  }

}