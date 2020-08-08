import mogoose, { Schema as Schemas, SchemaDefinition, SchemaOptions, PaginateModel, Document as MongooseDocument, Mongoose } from "mongoose";
import { MongodbOptions, Database, ModelList, MongoModelOptions, SchemaObject, ModelDictionary } from "./interfaces";
import mongoosePaginate from "mongoose-paginate";

let models: ModelDictionary = {};
const dbList: { [x: string]: Mongoose } = {};

export function Models(name: string): any {
  return (target: any, key: string): any => {
    // property getter method
    const getter = () => {
      return models[name];
    };

    // Delete property.
    if (delete target[key]) {
      // Create new property with getter and setter
      Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        get: getter,
      });
    }
  };
}

export function MongoDatabases(name: string): Mongoose {
  return dbList[name];
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
  private dbName: string;
  private modelList: ModelDictionary = {};

  get name(): string {
    return this.dbName;
  }

  get instance(): Mongoose {
    return this.dbInstance;
  }

  constructor(private mongoConnection: MongodbOptions) {
    const { name, schemas = [] } = mongoConnection;
    this.dbName = name;
    dbList[this.dbName] = mogoose;
    this.schemas = schemas;
    this.dbInstance = dbList[this.dbName];
  }

  connect(): Promise<any> {
    const {
      connectionString,
      options = { useCreateIndex: true, useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true },
    } = this.mongoConnection;
    return this.dbInstance.connect(connectionString, options);
  }

  connection(logs: boolean): void {
    const name = this.dbName[0].toUpperCase() + this.dbName.slice(1);
    const checkConnection = setInterval(() => {
      if (this.dbInstance.connection.readyState === 1) {
        clearInterval(checkConnection);
        console.log(`\x1b[32m[mayajs] ${name} database is connected.\x1b[0m`);
        return;
      }

      const isConnecting = this.dbInstance.connection.readyState === 2;

      if (isConnecting && logs) {
        console.log(`\x1b[33m[mayajs] Waiting for ${name} database to connect.\x1b[0m`);
      }
    }, 1000);
  }

  models(): ModelDictionary {
    this.mapSchema(this.schemas);
    models = { ...models, ...this.modelList };
    return this.modelList;
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
    return Object.keys(this.modelList).some((value: any) => value === name);
  }

  private addModelToList<T extends Document>(name: string, modelInstance: PaginateModel<T>): void {
    const modelName = this.sanitizeModelName(name);
    if (!this.modelNameExist(modelName)) {
      this.modelList[modelName] = modelInstance;
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
