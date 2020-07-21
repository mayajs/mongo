import { connect, connection, Schema as Schemas, model, SchemaDefinition, SchemaOptions, PaginateModel, Document as MongooseDocument } from "mongoose";
import { ModelPaginate, MongodbOptions, Database, ModelList, MongoModelOptions } from "./interfaces";

const models: ModelPaginate[] = [];

export function Models(name: string): any {
  return (target: any, key: string): any => {
    // property value
    let value = target[key];

    // property getter method
    const getter = () => {
      return models.filter((e) => e[name])[0][name];
    };

    // property setter method
    const setter = (newVal: string) => {
      value = models.filter((e) => e[newVal])[0][newVal];
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

export function MongoSchema(object: SchemaDefinition, options?: SchemaOptions): Schemas {
  return new Schemas(object, options);
}

export function MongoModel<T extends MongooseDocument>(name: string, schema: Schemas, options: MongoModelOptions = {}): PaginateModel<T> {
  const modelInstance = model<T>(name, schema);
  if (options && options.discriminators && options.discriminators.length > 0) {
    options.discriminators.map((discriminator) => {
      const discriminatorModel = modelInstance.discriminator(discriminator.key, discriminator.schema) as PaginateModel<T>;
      models.push({ [discriminator.key.toLowerCase()]: discriminatorModel });
    });
  }
  models.push({ [name]: modelInstance });
  return modelInstance;
}

class MongoDatabase implements Database {
  constructor(private mongoConnection: MongodbOptions) {}

  connect(): Promise<any> {
    const {
      connectionString,
      options = {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    } = this.mongoConnection;

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
    modelList.map((model) => {
      import(model.path).then((e) => {
        models.push({ [model.name]: e.default });
      });
    });
  }
}

export function Mongo(options: MongodbOptions): MongoDatabase {
  return new MongoDatabase(options);
}

// tslint:disable: no-empty-interface
export interface Document extends MongooseDocument {}

// tslint:disable-next-line: variable-name
export const Schema = Schemas;
