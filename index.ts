import { connect, connection } from "mongoose";
import { Database, MongoConnectionOptions } from "@mayajs/core";
import { IPaginateModel } from "./lib/Interfaces";
import paginate from "mongoose-paginate";

const models: IPaginateModel[] = [];
