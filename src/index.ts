import { connect, connection, Schema, model, SchemaDefinition, SchemaOptions, PaginateModel, Document } from "mongoose";
import { ModelPaginate, ConnectionOptions, Database, ModelList } from "./interfaces";

const models: ModelPaginate[] = [];

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

export function MongoSchema(object: SchemaDefinition, options?: SchemaOptions): Schema {
  return new Schema(object, options);
}

export function MongoModel(name: string, schema: Schema): PaginateModel<Document> {
  const modelObject = model(name, schema);
  models.push({ [name]: modelObject });
  return modelObject;
}

class MongoDatabase implements Database {
  constructor(private mongoConnection: ConnectionOptions) {}

  connect(): Promise<any> {
    const { connectionString, options } = this.mongoConnection;
    return connect(connectionString, options);
  }

  connection(logs: boolean): void {
    let isConnecting = false;
    const checkConnection = setInterval(() => {
      if (connection.readyState === 2 && !isConnecting) {
        isConnecting = true;
        if (logs) {
          console.log(`\x1b[33m[mayajs] connecting to database\x1b[0m`);
        }
      } else {
        clearInterval(checkConnection);
      }
    }, 1000);
  }

  models(modelList: ModelList[]): void {
     modelList.map(model => {
      import(model.path).then(e => {
        models.push({ [model.name]: e.default });
      });
    });
  }
}

export function Mongo(options: ConnectionOptions): MongoDatabase {
  return new MongoDatabase(options);
}
