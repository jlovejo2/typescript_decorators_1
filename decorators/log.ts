import { Request, Response } from "express";

//method decorator (not a factory)
export function logRoute(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  //save original function
  const original = descriptor.value
  descriptor.value = function (...args: any[]) {
    let req = args[0] as Request
    let res = args[1] as Response
    //call the original function with arguments that were passed into it
    original.apply(this, args);
    //log to console
    console.log(`${req.ip} [${new Date().toISOString()}] ${req.hostname} ${req.originalUrl} ${req.method} ${res.statusCode} ${res.statusMessage} HTTP/${req.httpVersion}`);
    //if you are using PUT OR POST going to output body that was sent in
    if (["PUT", "POST"].indexOf(req.method) > -1) {
      console.log(`\tBODY: ${JSON.stringify(req.body)}`)
    }
  }

}