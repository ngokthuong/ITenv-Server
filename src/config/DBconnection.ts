import mongoose from "mongoose";

export const connection = async () => {
    mongoose.Promise = Promise;
    mongoose.connect(process.env.MONGO_URL ?? "")
    mongoose.connection.on('error', (error: Error) => console.log(error))
}
