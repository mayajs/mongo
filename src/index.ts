import mogoose, { Schema as Schemas, SchemaDefinition, SchemaOptions, PaginateModel, Document as MongooseDocument, Mongoose } from "mongoose";
import { ModelPaginate, MongodbOptions, Database, ModelList, MongoModelOptions, SchemaObject } from "./interfaces";
import mongoosePaginate from "mongoose-paginate";

const models: ModelPaginate[] = [];
const dbList: { [x: string]: Mongoose } = {};

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

export function MongoModel(name: string, schema: Schemas, options: MongoModelOptions = {}): SchemaObject {
  return { name, schema, options };
}

class MongoDatabase implements Database {
  private dbInstance: Mongoose;
  private schemas: SchemaObject[] = [];

  constructor(private mongoConnection: MongodbOptions) {
    const { name, schemas = [] } = mongoConnection;
    const dbName = name ?? `db${Object.keys(dbList).length + 1}`;
    dbList[dbName] = mogoose;
    this.schemas = schemas;
    this.dbInstance = dbList[dbName];
  }

  connect(): Promise<any> {
    const {
      connectionString,
      options = { useCreateIndex: true, useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true },
    } = this.mongoConnection;
    return this.dbInstance.connect(connectionString, options);
  }

  connection(logs: boolean): void {
    const checkConnection = setInterval(() => {
      if (this.dbInstance.connection.readyState === 1) {
        clearInterval(checkConnection);
        return;
      }

      const isConnecting = this.dbInstance.connection.readyState === 2;

      if (isConnecting && logs) {
        console.log(`\x1b[33m[mayajs] connecting to database\x1b[0m`);
      }
    }, 1000);
  }

  models(modelList: ModelList[]): void {
    this.mapSchema(this.schemas);
    modelList.map(async (model: any) => {
      const instance = await import(model.path);
      const { name, schema, options } = instance.default ?? instance;
      this.addModel(name, schema, options);
    });
  }

  private mapSchema(schemas: SchemaObject[]): void {
    schemas.map((schemaObject: SchemaObject) => {
      this.addModel(schemaObject.name, schemaObject.schema, schemaObject.options);
    });
  }

  private addModel<T extends MongooseDocument>(name: string, schema: Schemas, options: MongoModelOptions = {}): void {
    const modelInstance = this.dbInstance.model<T>(name, schema);
    this.addModelToList(name, modelInstance);

    if (options && options.discriminators && options.discriminators.length > 0) {
      options.discriminators.map(this.addDiscriminatorModel(modelInstance));
    }
  }

  private addDiscriminatorModel<T extends MongooseDocument>(modelInstance: mogoose.PaginateModel<T>): (arg: any) => void {
    return (discriminator: any) => {
      if (!this.modelNameExist(discriminator.key)) {
        const discriminatorModel = modelInstance.discriminator(discriminator.key, discriminator.schema) as PaginateModel<T>;
        this.addModelToList(discriminator.key, discriminatorModel);
      }
    };
  }

  private sanitizeModelName(name: string): string {
    return name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }

  private modelNameExist(name: string): boolean {
    return models.some((value: any) => Object.keys(value)[0] === name);
  }

  private addModelToList<T extends Document>(name: string, modelInstance: PaginateModel<T>): void {
    const modelName = this.sanitizeModelName(name);
    if (!this.modelNameExist(modelName)) {
      models.push({ [modelName]: modelInstance });
    }
  }
}

export function Mongo(options: MongodbOptions): MongoDatabase {
  return new MongoDatabase(options);
}

// tslint:disable: no-empty-interface
export interface Document extends MongooseDocument {}

// tslint:disable-next-line: variable-name
export const Schema = Schemas;

// tslint:disable-next-line: variable-name
export const MongoPaginate = mongoosePaginate;
