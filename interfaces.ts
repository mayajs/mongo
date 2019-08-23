import { PaginateModel, ConnectionOptions } from "mongoose";

export interface ModelPaginate {
  [k: string]: PaginateModel<any>;
}

export interface MongoConnectionOptions {
  connectionString: string; // Connection string
  options?: ConnectionOptions; // Mongoose connect options OPTIONAL
}
