import { db } from './app';
import * as uuid from 'uuid';
import express, { Router, Request, Response } from 'express';
import BaseEntity, { EntityTypeInstance, EntityFactory } from './entities/BaseEntity';

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

  private fetchAllEntities(req: Request, res: Response) {
    let data = {}
    data = db.getData(`/${this.name}`);
    res.json(data);
  }

  private fetchEntity(req: Request, res: Response) {
    let data = {}
    data = db.getData(`/${this.name}/${req.params.id}`);
    res.json(data);
  }

  private createEntity(req: Request, res: Response) {

  }

  private updateEntity(req: Request, res: Response) {

  }

  private deleteEntity(req: Request, res: Response) {
    db.delete(`/${this.name}/${req.params.id}`)
    res.json({})
  }

}