import mongoose, { disconnect } from "mongoose";

export const connection = async () => {
    try {
        mongoose.Promise = Promise;
        const dbCon = await mongoose.connect(process.env.MONGO_URL ?? "")
        mongoose.connection.on('error', (error: Error) => console.log(error))
        if (dbCon.connection.readyState === 1) {
            console.log('Database connection is successfully')
        } else {
            console.log('Database connecting')
        }
    } catch (error) {
        console.log('Database connection is failed')
        // return error to client 
        throw new Error(String(error))
    }
}
