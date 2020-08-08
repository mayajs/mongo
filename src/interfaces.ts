import { PaginateModel, ConnectionOptions, Schema, Document } from "mongoose";

export interface ModelDictionary {
  [k: string]: PaginateModel<any>;
}

export interface ModelPaginate {
  [k: string]: PaginateModel<any>;
}

export interface SchemaObject {
  name: string;
  schema: Schema;
  options?: MongoModelOptions;
}

export interface MongodbOptions {
  connectionString: string; // Connection string
  name: string; // Mongodb instance name
  options?: ConnectionOptions; // Mongoose connect options OPTIONAL
  schemas?: SchemaObject[]; // List of SchemaObject
}

export interface Database {
  connect: () => Promise<any>;
  connection: (logs: boolean) => void;
  models: (array: ModelList[]) => void;
}

export interface ModelList {
  name: string;
  path: string;
}

export interface MongoModelOptions {
  discriminators?: Array<{ key: string; schema: Schema }>;
}
