import { CustomModule, ModuleWithProviders } from "@mayajs/router";
import { MongodbOptions } from "./interfaces";
import { MongoDbServices } from "./mongodb.service";

export class MongoDbModule extends CustomModule {
  static options: MongodbOptions;

  static forRoot(options: MongodbOptions): ModuleWithProviders {
    this.options = options;
    return { module: MongoDbModule, providers: [MongoDbServices], dependencies: [MongoDbServices], imports: [] };
  }

  constructor(private mongo: MongoDbServices) {
    super();
  }

  invoke(): void {
    this.mongo.options = MongoDbModule.options;
    this.mongo.connect(MongoDbModule.options.name);
    this.mongo.mapSchemas(MongoDbModule.options.name);
  }
}
