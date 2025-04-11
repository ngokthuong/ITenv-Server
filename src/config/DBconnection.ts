import mongoose, { disconnect } from 'mongoose';

export const connection = async () => {
  try {
    const a = 0;
    const dbCon = await mongoose.connect(
      process.env.MONGO_URL ?? 'mongodb://localhost:27018/DevArticlesDB',
    );
    mongoose.connection.on('error', (error: Error) => console.log(error));
    if (dbCon.connection.readyState === 1) {
      console.log('Database connection is successfully');
    } else {
      console.log('Database connecting');
    }

    // server error or server off
    process.on('SIGINT', async () => {
      await mongoose.disconnect();
      console.log('Database connection is closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.log('Database connection is failed');
    // return error to client
    throw new Error(String(error));
  }
};
