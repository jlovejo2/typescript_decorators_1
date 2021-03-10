import APIServer from "./APIServer";
import { Request, Response } from 'express';

const server = new APIServer();

class APIRoutes {

  @logRoute()
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

function logRoute(): MethodDecorator {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value
    //wrap the original function with a function. In that function log to console
    descriptor.value = function (...args: any[]) {
      let req = args[0] as Request;
      console.log(`${req.url} ${req.method} Called`);
      //return the original function
      return original.apply(this, args);
    }
  }
}

server.start();