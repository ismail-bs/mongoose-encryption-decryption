import * as Mongoose from 'mongoose';
Mongoose.set('strictQuery', true);

export const connectTestDatabase = async (): Promise<void> => {
  await Mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mongoose-encryption-decryption-test');
};

export const disConnectTestDatabase = async (): Promise<void> => {
  await Mongoose.disconnect();
};

export const removeTestCollection = async (
  collection: string,
): Promise<void> => {
  await Mongoose.connection.dropCollection(collection);
};
