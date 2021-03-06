import * as http from 'http';
import express, { Request, Response, Express } from 'express';
import BaseEntity from './entities/BaseEntity';
import bodyParser from 'body-parser';
import EntityRouter from './EntityRouter';

export default class APIServer {
  
  private _app: Express;

  get app(): Express {
    return this._app;
  }

  private _server: http.Server;

  get server(): http.Server {
    return this._server
  }

  constructor() {
    this._app = express();

    //Set Port
    this._app.set("port", process.env.PORT || 3000)

    this.configureMiddleware()
  }

  public configureMiddleware() {
    // Setup body parsing - requried for POST requests
    this._app.use(bodyParser.json());
    this._app.use(bodyParser.urlencoded({ extended: true }))
    
    //Set up CORS
    this.app.use(function (req, res, next) {
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader("Access-Control-Allow-Credentials", "true")
      res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")
      res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,Authorization")
      next();
    })
  
  }

  public addEntity<T extends BaseEntity>(clazz) {
    // get name of entity
    const name = Reflect.getMetadata("entity:name", clazz);
    // pass into new entity router instance
    let entityRouter = new EntityRouter<T>(name, clazz)
    // configure express to use that name for route
    this._app.use(`/${name}`, entityRouter.router)
  }

  public start() {
    this._server = this._app.listen(this._app.get("port"), () => {
      console.log("Server is running on port " + this._app.get("port"))
    })
  }

}