import {
  connect,
  connection,
  Schema as Schemas,
  model,
  SchemaDefinition,
  SchemaOptions,
  PaginateModel,
  Document as MongooseDocument,
  Mongoose,
} from "mongoose";
import { ModelPaginate, MongodbOptions, Database, ModelList, MongoModelOptions, SchemaObject } from "./interfaces";

const models: ModelPaginate[] = [];

export function Models(name: string): any {
  return (target: any, key: string): any => {
    // property value
    let value = target[key];

    // property getter method
    const getter = () => {
      return models.filter((e: any) => e[name])[0][name];
    };

    // property setter method
    const setter = (newVal: string) => {
      value = models.filter((e: any) => e[newVal])[0][newVal];
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
    options.discriminators.map((discriminator: any) => {
      const discriminatorModel = modelInstance.discriminator(discriminator.key, discriminator.schema) as PaginateModel<T>;
      models.push({ [discriminator.key.toLowerCase()]: discriminatorModel });
    });
  }
  models.push({ [name]: modelInstance });
  return modelInstance;
}

class MongoDatabase implements Database {
  private dbInstance: Mongoose;
  private schemas: SchemaObject[] = [];

  constructor(private mongoConnection: MongodbOptions) {
    this.dbInstance = new Mongoose();
  }

  async connect(): Promise<any> {
    const {
      connectionString,
      options = {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      schemas = [],
    } = this.mongoConnection;

    this.schemas = schemas;
    this.dbInstance = await connect(connectionString, options);
    return this.dbInstance;
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
    this.mapSchema(this.schemas);
    modelList.map((model: any) => {
      import(model.path).then((e: any) => {
        models.push({ [model.name]: e.default });
      });
    });
  }

  private mapSchema(schemas: SchemaObject[]): void {
    schemas.map((schemaObject: SchemaObject) => {
      this.addModel(schemaObject.name, schemaObject.schema, schemaObject.options);
    });
  }

  private addModel<T extends MongooseDocument>(name: string, schema: Schemas, options: MongoModelOptions = {}): void {
    const modelInstance = this.dbInstance.model<T>(name, schema);
    if (options && options.discriminators && options.discriminators.length > 0) {
      options.discriminators.map((discriminator: any) => {
        const discriminatorModel = modelInstance.discriminator(discriminator.key, discriminator.schema) as PaginateModel<T>;
        models.push({ [discriminator.key.toLowerCase()]: discriminatorModel });
      });
    }
    models.push({ [name]: modelInstance });
  }
}

export function Mongo(options: MongodbOptions): MongoDatabase {
  return new MongoDatabase(options);
}

// tslint:disable: no-empty-interface
export interface Document extends MongooseDocument {}

// tslint:disable-next-line: variable-name
export const Schema = Schemas;
