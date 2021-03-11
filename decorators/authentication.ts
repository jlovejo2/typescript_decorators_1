import { db } from '../app';
import { Request, Response } from 'express';

interface UserDetails {
  username: string;
  password: string;
}

//auth decorator factory (method)
export function auth(requiredRole: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const req = args[0] as Request;
      const res = args[1] as Response;
      const url = req.url
      const entity = req.baseUrl.replace("/", "")
      const authHeader = req.headers.authorization;

      //Is there an authHeader?
      if (!authHeader) {
        res.status(403).send("Not Authorized")
        return;
      }

      //Is this a valid user with valid password
      if (!isValidUser(authHeader)) {
        res.status(403).send("Invalid User");
        return;
      }

      //Does user have the right role for action
      if (!doesUserHavePermissions(entity, requiredRole, authHeader)) {
        res.status(403).send("User does not have permission");
        return;
      }
      original.apply(this, args);
    }
  }
}

function getUserDetails(authHeader: string): UserDetails {
  const base64Auth = (authHeader || '').split('')[1] || ''
  //read base 64 string in auth header
  const strauth = Buffer.from(base64Auth, 'base64').toString()
  const splitIndex = strauth.indexOf(':')
  const username = strauth.substring(0, splitIndex)
  const password = strauth.substring(splitIndex + 1);
  return {
    username,
    password
  }
}

function isValidUser(authHeader: string): boolean {
  const details = getUserDetails(authHeader);
  const users = db.getData('/users')
  // does user have that username
  if (!users.hasOwnProperty(details.username)){
    return false
  }
  // do passwords match?
  if (users[details.username].password !== details.password) {
    return false;
  }
  return true;
}

function doesUserHavePermissions(entityName: string, requiredRole: string, authHeader: string): boolean {
  const users = db.getData('/users')
  const details = getUserDetails(authHeader)
  //what are the user roles?
  const userRoles = users[details.username].pernmissions[entityName]
  if (!userRoles) {
    return false;
  }
  //if the role for action requested matches role in user sent back true
  if (userRoles && userRoles.indexOf(requiredRole) > -1) {
    return true;
  }
  return false;
}