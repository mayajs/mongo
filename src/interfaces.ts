import { PaginateModel, ConnectionOptions, Schema, Mongoose } from "mongoose";

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
  name: string;
  instance: Mongoose;
  connect: () => Promise<any>;
  connection: (logs: boolean) => void;
  models: () => ModelDictionary;
}

export interface MongoModelOptions {
  discriminators?: Array<{ key: string; schema: Schema }>;
}
