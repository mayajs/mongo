import { PaginateModel, ConnectionOptions, Schema, Mongoose } from "mongoose";
interface ModelDictionary {
  [k: string]: PaginateModel<any>;
}

interface SchemaObject {
  name: string;
  schema: Schema;
  options?: MongoModelOptions;
}

export interface MongodbOptions extends MongoInstanceProps {
  name: string;
}

interface MongoInstanceProps {
  connectionString: string;
  options?: ConnectionOptions;
  schemas?: SchemaObject[];
}

interface MongoModelOptions {
  discriminators?: Array<{ key: string; schema: Schema }>;
}

export interface MongoInstance extends MongoInstanceProps {
  instance: Mongoose;
  models: ModelDictionary;
}

export interface MongoDatabases {
  [x: string]: MongoInstance;
}
