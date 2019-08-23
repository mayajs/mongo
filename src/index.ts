import { ModelPaginate, ConnectionOptions, Database, ModelList } from "./interfaces";
import { connect, connection } from "mongoose";
import paginate from "mongoose-paginate";

const models: ModelPaginate[] = [];

export * from "mongoose";
export { paginate };

export function Models(name: string): (target: any, key: string) => void {
  return (target: any, key: string): void => {
    // property value
    let value = target[key];

    // property getter method
    const getter = () => {
      return models.filter(e => e[name])[0][name];
    };

    // property setter method
    const setter = (newVal: string) => {
      value = models.filter(e => e[newVal])[0][newVal];
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

class MongoDatabase implements Database {
  constructor(private mongoConnection: ConnectionOptions) {}

  connect(): Promise<any> {
    const { connectionString, options } = this.mongoConnection;
    return connect(
      connectionString,
      options
    );
  }

  connection(logs: boolean): void {
    let isConnecting = false;
    const checkConnection = setInterval(() => {
      if (connection.readyState === 2 && !isConnecting) {
        isConnecting = true;
        if (logs) {
          console.log("\n\x1b[33mTrying to connect database.\x1b[0m");
        }
      } else {
        clearInterval(checkConnection);
      }
    }, 1000);
  }

  models(array: ModelList[]): void {
    array.map(model => {
      import(model.path).then(e => {
        models.push({ [model.name]: e.default });
      });
    });
  }
}

export function Mongo(options: ConnectionOptions): MongoDatabase {
  return new MongoDatabase(options);
}
