<p align="center"><img src="https://github.com/mayajs/maya/blob/master/maya.svg"></p>
<h1 align="center">Mongodb Module and Service</h1>

## Description

A MayaJS module and service that deals with Mongodb drivers. It uses `mongoose` as its core dependency to communicate with the database.

## Installation

```shell
npm i @mayajs/mongo
```

## Quick Start

MayaJS uses custom modules to add functionality on its core. You can use `MongoDbModule` and import in on any MayaJS module in your project.

```ts
import { MongoDbModule } from "@mayajs/mongo";
import { Schema } from "mongoose";

// Define schema for mongoose
const User = new Schema({
  name: String,
  email: String,
  password: String,
});

const mongodbOptions = {
  connectionString: "your-mongodb-connection-string",
  name: "your-collection-name",
  options: {
    // Any mongoose options can be used here
    // i.e. useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false
  },
  schemas: [
    {
      name: "User", // Name of model
      schema: User, // Mongoose Schema
    },
    ,
  ],
};

@Module({
  imports: [MongoDbModule.forRoot(mongodbOptions)],
})
class CustomModule {}
```

## Usage

To use mongodb inside your controller you will need to import `MongoDbServices`. MongoDbServices provides set of functionality to access, manipulate and interact with mongodb.

### Accessing a Collection

MongoDbServices provides a `database` function to access a specific collection in mongodb.

```ts
import { MongoDbServices } from "@mayajs/mongo";

@Controller()
class UsersController {
  // Inject MongoDbServices in a controller
  constructor(private mongo: MongoDbServices) {}

  sample() {
    // Get specific collection in mongodb
    const db = this.mongo.database("your-collection-name");
  }
}
```

### Accessing a Model

To access a model you will need first the get the collection instance that we get from the above example. On the db instance you can access the `model` object like seen below.

```ts
sample() {
  // Get specific collection in mongodb
  const db = this.mongo.database("your-collection-name");

  // Get specific model instance
  const model = db.instance.model("your-model-name");
}
```

This model instance is based on [Mongoose Model](https://mongoosejs.com/docs/api/model.html). All of mongoose functionality is available for this model instance.

## Collaborating

See collaborating guides [here.](https://github.com/mayajs/maya/blob/master/COLLABORATOR_GUIDE.md)

## People

Author and maintainer [Mac Ignacio](https://github.com/macign)

## License

[MIT](https://github.com/mayajs/maya/blob/master/LICENSE)
