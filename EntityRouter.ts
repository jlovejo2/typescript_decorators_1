import { db } from './app';
import * as uuid from 'uuid';
import express, { Router, Request, Response } from 'express';
import BaseEntity, { EntityTypeInstance, EntityFactory } from './entities/BaseEntity';
import { logRoute, validate, auth } from './decorators';
export default class EntityRouter<T extends BaseEntity> {
  
  private _router: Router;

  get router(): Router {
    return this._router
  }

  constructor(public name: string, private classRef: EntityTypeInstance<T>) {
    this._router = express.Router()
    this.addEntityRoutes();
  }

  addEntityRoutes() {
    //CREATE
    this._router.post('/', (req, res) => {
      console.log('enter POST....')
      this.createEntity(req, res)
    })

    // READ all
    this._router.get('/', (req, res) => {
      this.fetchAllEntities(req, res)
    })
    
    //READ ONE
    this._router.get('/:id', (req, res) => {
      this.fetchEntity(req, res);
    })
  
    // UPDATE
    this._router.post('/:id', (req, res) => {
      this.updateEntity(req, res)
    })

    // DELETE
    this._router.delete('/:id', (req, res) => {
      this.deleteEntity(req, res)
    })
  }

  @auth("reader")
  @logRoute
  private fetchAllEntities(req: Request, res: Response) {
    let data = {}
    data = db.getData(`/${this.name}`);
    res.json(data);
  }

  @auth("reader")
  @logRoute
  private fetchEntity(req: Request, res: Response) {
    let data = {}
    data = db.getData(`/${this.name}/${req.params.id}`);
    res.json(data);
  }

  @auth("writer")
  @logRoute
  private createEntity(req: Request, res: Response) {
    // create new persistence obj based on what is passed in
    let newEntity = EntityFactory.formPersistenceObject<T>(req.body, this.classRef);
    
    // validate the entity and send back any errors if the entity doesn't pass validation
    let errorMap = validate(newEntity)
    if (Object.keys(errorMap).length > 0) {
      const output = { errors: errorMap }
      res.status(400).json(output);
      return;
    }
    
    // getting the id property
    const idProperty = Reflect.getMetadata("entity:id", newEntity);
    // setting id value getting uuid
    newEntity[idProperty] = uuid.v4();
    // passing value into the database, with persistance object
    console.log('newEntity: ', newEntity)
    db.push(`/${this.name}/${newEntity[idProperty]}`, newEntity.getPersistenceObject());
    res.status(200).json(newEntity)
  }

  @auth("writer")
  @logRoute
  private updateEntity(req: Request, res: Response) {
    // does entity exist in db?
    let data = {}
    try {
      data = db.getData(`${this.name}/${req.params.id}`)
    } catch (err) {
      res.status(404).json({error: "Object does not exist"})
    }

    // update the object
    let updatedData = req.body
    let updatedObj = EntityFactory.formPersistenceObject(data, this.classRef)
    const propKeys = Object.keys(updatedData)
    for (const propKey of propKeys) {
      updatedObj[propKey] = updatedData[propKey]
    }

    // validate the updated entity and send back any errors if the entity doesn't pass validation
    let errorMap = validate(updatedObj)
    if (Object.keys(errorMap).length > 0) {
      const output = { errors: errorMap }
      res.status(400).json(output);
      return;
    }

    //save and return data
    db.push(`/${this.name}/${req.params.id}`, updatedData, false)
    data = db.getData(`/${this.name}/${req.params.id}`)
    res.json(data);
  }

  @auth("deleter")
  @logRoute
  private deleteEntity(req: Request, res: Response) {
    db.delete(`/${this.name}/${req.params.id}`)
    res.json({})
  }

}