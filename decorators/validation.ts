import validator from "validator";
import "reflect-metadata";
import { mainModule } from "node:process";

type ValidationFunction = (target: any, propertyKey: string, validatorOptions?: any) => string | void;

interface ValidationRule {
  validationOptions?: any;
  validator: ValidationFunction;
}

export function validate(object: any) {
  //get keys back and define empty errorMap
  const keys = Reflect.getMetadata("validation:properties", object) as string[];
  let errorMap = {};

  // if keys isnt populated correctly
  if (!keys || !Array.isArray(keys)) {
    return errorMap;
  }

  // loop over those keys and get our rules
  // if it isn't an array we will continue otherwise, we will run each of the rule
  for (const key of keys) {
    const rules: ValidationRule[] = Reflect.getMetadata("validation:rules", object, key) as ValidationRule[]
    if (!Array.isArray(rules)) {
      continue;
    }
    for (const rule of rules) {
      const errorMessage = rule.validator(object, key, rule.validationOptions)
      if (errorMessage) {
        errorMap[key] = errorMap[key] || [];
        errorMap[key].push(errorMessage);
      }
    }
  }

  return errorMap;
}

//decorator that calls addVAlidation method
export function isEmail(target: any, propertyKey: string) {
  addValidation(target, propertyKey, emailValidator);
}

export function required(target: any, propertyKey: string) {
  addValidation(target, propertyKey, requiredValidator)
}

//decorator factory for this one
// advantage this allows us to pass in min and max parameters to be passed in as options
export function length(min: Number, max: Number) {
  const options = {
    min: min,
    max: max,
  }
  return function (target: any, propertyKey: string) {
    addValidation(target, propertyKey, lengthValidator, options)
  }
}

export function isPhone(target: any, propertyKey: string) {
  addValidation(target, propertyKey, phoneValidator)
}

export function isInteger(min: Number, max: Number) {
  const options = {
    min: min,
    max: max
  }
  return function (target: any, propertyKey: string) {
    addValidation(target, propertyKey, integerValidator, options)
  }
}

function addValidation(target: any, propertyKey: string, validator: ValidationFunction, validationOptions?: any) {
  // Grab all the properties for the object
  // if property key is not in properties metaData, add it
  let objectProperties: string[] = Reflect.getMetadata("validation:properties", target) || [];
  if (!objectProperties.includes(propertyKey)) {
    objectProperties.push(propertyKey)
    Reflect.defineMetadata("validation:properties", objectProperties, target);
  }

  // get list of validation rules
  let validators: ValidationRule[] = Reflect.getMetadata("validation:rules", target, propertyKey) || []
  // make new rule based on what was passed in
  let validationRule = {
    validator: validator,
    validationOptions: validationOptions
  };
  //add the new validation rule
  validators.push(validationRule);
  Reflect.defineMetadata("validation:rules", validators, target, propertyKey)
}

//___________________
// VALIDATOR FUNCTIONS
//___________________

function emailValidator(target: any, propertyKey: string): string | void {
  let value = target[propertyKey]
  if (value == null) {
    return;
  }
  const isValid = validator.isEmail(value);
  if (!isValid) {
    return `Property ${propertyKey} must be a valid email.`
  }
  return;
}

function requiredValidator(target: any, propertyKey: string): string | void {
  let value = target[propertyKey]
  if (value) {
    return;
  }
  return `Property ${propertyKey} is required.`
}

function integerValidator(target: any, propertyKey: string, validatorOptions: any): string | void {
  const value = target[propertyKey]
  if (value == null) {
    return;
  }
  const errorMessage = `Property ${propertyKey} must be an integer between ${validatorOptions.min} and ${validatorOptions.max}`
  if (!Number.isInteger(value)) {
    return errorMessage
  }
  if (value <= validatorOptions.max && value >= validatorOptions.min) {
    return;
  }
  return errorMessage;
}

function lengthValidator(target: any, propertyKey: string, validatorOptions: any): string | void {
  const options = {
    min: validatorOptions.min,
    max: validatorOptions.max
  }
  const isValid = validator.isLength(target[propertyKey] + '', options);
  if (!isValid) {
    return `Property ${propertyKey} must be a string between ${validatorOptions.min} and ${validatorOptions.max}`
  }
  return;
}

function phoneValidator(target: any, propertyKey: string, validatorOptions: any): string | void {
  let value = target[propertyKey]
  if (value == null) {
    return;
  }
  const isValid = validator.isMobilePhone(value);
  if (!isValid) {
    return `Property ${propertyKey} must be a valid phone number`
  }
  return;
}
