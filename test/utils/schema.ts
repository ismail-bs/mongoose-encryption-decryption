import { Schema } from 'mongoose';
export interface IPatient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isJestTestMock?: boolean;
}

export const PatientSchema = new Schema<IPatient>(
  {
    name: String,
    email: String,
    phone: String, 
    isJestTestMock: Boolean, // Just use it for testing purposes.
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
