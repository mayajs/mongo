import { DiscriminatorObject, MongoDatabases, MongodbOptions, MongoInstance } from "./interfaces";
import mongoose, { Document, PaginateModel } from "mongoose";
import { Services } from "@mayajs/router";

export class MongoDbServices extends Services {
  private list: MongoDatabases;

  constructor() {
    super();
    this.list = {};
  }

  async connect(name: string) {
    const db = this.list[name];
    try {
      const instance = await db.instance.connect(db.connectionString, db.options);
      this.list[name].instance = instance;
      console.log(`\x1b[32m[mayajs] ${name} is connected!\x1b[0m`);
      return instance;
    } catch (error) {
      console.log(error);
    }
  }

  set options(value: MongodbOptions) {
    const { name, ...rest } = value;
    const options = { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true, ...rest.options };
    this.list[name] = { ...rest, options, instance: mongoose, models: {} };
  }

  database(name: string): MongoInstance {
    return this.list[name];
  }

  mapSchemas(name: string) {
    const db = this.list[name];

    if (db.schemas && db.schemas?.length > 0) {
      db.schemas.map(({ name, schema, options }) => {
        const model = db.instance.model(name, schema);
        if (options && options?.discriminators && options?.discriminators.length > 0) {
          options.discriminators.map(this.addDiscriminatorModel(db, model));
        }
        db.models[name] = model;
      });
    }
  }

  private addDiscriminatorModel<T extends Document>(db: MongoInstance, modelInstance: mongoose.PaginateModel<T>): (arg: any) => void {
    return (discriminator: DiscriminatorObject) => {
      const model = modelInstance.discriminator(discriminator.key, discriminator.schema) as PaginateModel<T>;
      db.models[discriminator.key] = model;
    };
  }
}
