<p align="center"><img src="https://github.com/mayajs/maya/blob/master/maya.svg"></p>

<h1 align="center">Mongo Decorators and Modules</h1>

## Decorators

### Models
> Creates a model intance based on the name passed on the parameter. 

MayaJS collect and store all the models defined on the `@Controller` decorators to a single object. Everytime the `@Models` decorator is attached to a variable it replace its value with a model instance. This model instance is based on [mongoose model](https://mongoosejs.com/docs/api/model.html). All of mongoose functionality is available for this model instance.

#### Pseudo Code
```javascript
   @Models(model_name:string) varaiable_name;
```

#### Sample Code
```javascript
   @Models("sample") model;
```

## Modules

### Mongo

> A wrapper for mongoose that MayaJS use to connect to MongoDB.

Mongo accepts an object settings that will set the connection for MongoDB. MayaJS will automatically connect to the specified settings whenever the server starts. It will also set the models using the models function. It typically used inside the `@App` decorator on the options paramater.

#### Options
```javascript
{
  connectionString: string; // Connection string
  options?: ConnectionOptions; // Mongoose connect options OPTIONAL
}
```
>**NOTE:** See full documentation of [ConnectionOptions here.](https://mongoosejs.com/docs/connections.html#options)

#### Sample Code
```javascript
@App({
  database: Mongo({
    connectionString: process.env.MONGO_CONNECTION_URL || "your-connection-string-here",
    options: { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false },
  }),
})
export class AppModule {}
```
