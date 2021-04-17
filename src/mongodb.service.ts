import { MongoDatabases, MongodbOptions, MongoInstance } from "./interfaces";
import { Services } from "@mayajs/router";
import mongoose from "mongoose";

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
      console.log(`${name} is connected!`);
      return instance;
    } catch (error) {
      console.log(error);
    }
  }

  set options(value: MongodbOptions) {
    const { name, ...options } = value;
    this.list[name] = {
      ...options,
      options: { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false, ...options.options },
      instance: mongoose,
      models: {},
    };
  }

  database(name: string): MongoInstance {
    return this.list[name];
  }

  mapSchemas(name: string) {
    const db = this.list[name];

    if (db.schemas && db.schemas?.length > 0) {
      db.schemas.map(({ name, schema, ...options }) => {
        const model = db.instance.model(name, schema);
        db.models[name] = model;
      });
    }
  }
}
