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

export class Mongo implements Database {
  mongoConnection: MongoConnectionOptions;

  constructor() {
    this.mongoConnection = {
      connectionString: "",
      options: {},
    };
  }

  connect(): Promise<any> {
    const { connectionString, options } = this.mongoConnection;
    return connect(
      connectionString,
      options
    );
  }

  connection(logs: boolean) {
    let isConnecting = false;
    const checkConnection = setInterval(() => {
      if (connection.readyState === 2 && !isConnecting) {
        isConnecting = true;
        if (logs) {
          console.log("\n\x1b[33mTrying to connect database.\x1b[0m");
        }
      } else {
        clearInterval(checkConnection);
      }
    }, 1000);
  }

  models(array: IPaginateModel[]) {
    array.map(model => models.push(model));
  }
}
