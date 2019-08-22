import { connect, connection } from "mongoose";
import { Database, MongoConnectionOptions } from "@mayajs/core";
import { IPaginateModel } from "./lib/Interfaces";
import paginate from "mongoose-paginate";

const models: IPaginateModel[] = [];

export function Models(name: string): (target: any, key: string) => void {
  return (target: any, key: string): void => {
    // property value
    let value = target[key];

    // property getter method
    const getter = () => {
      return models.filter(e => e[name])[0][name];
    };

    // property setter method
    const setter = (newVal: string) => {
      value = models.filter(e => e[newVal])[0][newVal];
    };

    // Delete property.
    if (delete target[key]) {
      // Create new property with getter and setter
      Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        get: getter,
        set: setter,
      });
    }
  };
}
