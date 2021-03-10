import APIServer from "./APIServer";
import { Request, Response } from 'express';

const server = new APIServer();

class APIRoutes {

  @route("get", "/")
  public indexRoute(req: Request, res: Response) {
    return {
      "Hello": "World"
    }
  }

}

function route(method: string, path: string): MethodDecorator {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // get app reference to express application, call method on that which is tied to method passed in(in this case GET)
    // passing in path and function that gets exectued when path is called
    // send back 200 status and json value that is object of descriptor.value function
    server.app[method](path, (req: Request, res: Response) => {
      res.status(200).json(descriptor.value(req, res));
    })
  }
}

server.start();