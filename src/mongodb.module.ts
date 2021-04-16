import { CustomModule, ModuleWithProviders } from "@mayajs/router";
import { MongodbOptions } from "./interfaces";
import { MongodbServices } from "./mongodb.service";

export class MongoDbModule extends CustomModule {
  static options: MongodbOptions;

  static forRoot(options: MongodbOptions): ModuleWithProviders {
    this.options = options;
    return { module: MongoDbModule, providers: [MongodbServices], dependencies: [MongodbServices], imports: [] };
  }

  constructor(private mongo: MongodbServices) {
    super();
  }

  invoke(): void {
    this.mongo.options = MongoDbModule.options;
    this.mongo.connect(MongoDbModule.options.name);
    this.mongo.mapSchemas(MongoDbModule.options.name);
  }
}
