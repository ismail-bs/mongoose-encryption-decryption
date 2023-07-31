import { Schema, model } from 'mongoose';
import { mongooseEncryptionDecryption } from 'src/index';
import { IPatient, PatientSchema } from './utils/schema';
import { connectTestDatabase, disConnectTestDatabase } from './utils/database';
const patientData = {
  name: 'Md Ismail Hosen',
  email: 'ismailhosen601@gmail.com',
  phone: '+8801770964628',
};

describe('Mongoose Schema Hooks', () => {
  let schema: Schema<any>;
  let patientModel: any;
  let patientId: string;

  beforeAll(async () => {
    await connectTestDatabase();
    // Create a new Mongoose schema for all test
    schema = new Schema<any>(PatientSchema);
    schema.plugin(mongooseEncryptionDecryption, {
      encodedFields: ['email', 'phone'],
      privateKey: 'supersecret',
    });

    patientModel = model<IPatient>('patient', schema);
    await patientModel.deleteMany();
  });

  afterAll(async () => {
    try {
      await patientModel.deleteMany();
      await disConnectTestDatabase();
    } catch (error) {}
  });

  test('Create a new patient with encrypted email and phone', async () => {
    // Create a new patient document with encrypted email and phone fields
    const patient: IPatient = await patientModel.create({
      ...patientData,
      isJestTestMock: true, // Just use it for testing purposes.
    });

    // Ensure the patient name is correct
    expect(patient.name).toEqual(patientData.name);

    // Ensure the email and phone fields are encrypted
    expect(patient.email).not.toEqual(patientData.email);
    expect(patient.phone).not.toEqual(patientData.phone);

    // Store the _id of the created patient for future tests
    patientId = patient._id;

    // Perform an update operation on the patient document to change the isJestTestMock field.
    await patientModel.findOneAndUpdate(
      { _id: patientId },
      { isJestTestMock: false },
    );
  });

  test('Find a patient by id and verify decrypted email and phone', async () => {
    // Find the patient by id
    const patient: IPatient = await patientModel.findById(patientId);

    // Ensure the patient's name is correct
    expect(patient.name).toEqual(patientData.name);

    // Ensure the email and phone fields are decrypted
    expect(patient.email).not.toBeUndefined;
    expect(patient.phone).not.toBeUndefined;
  });

  test('Find a patient by any field and verify decrypted email and phone', async () => {
    // Find the patient by any field (here, _id is used)
    const patient: IPatient = await patientModel.findOne({
      _id: patientId,
    });

    // Ensure the patient's name is correct
    expect(patient.name).toEqual(patientData.name);

    // Ensure the email and phone fields are decrypted
    expect(patient.email).not.toBeUndefined;
    expect(patient.phone).not.toBeUndefined;
  });

  test('Find a patient by id and select only the email field', async () => {
    // Find the patient by id and select only the email field
    const patient: IPatient = await patientModel
      .findOne({
        _id: patientId,
      })
      .select('email');

    // Ensure only the email field is selected and decrypted
    expect(patient.email).toEqual(patientData.email);
    expect(patient.phone).toBeUndefined;
  });

  test('Find a patient by id and get the raw JSON (lean)', async () => {
    // Find the patient by id and return the raw JSON (lean)
    const patient: IPatient = await patientModel
      .findOne({
        _id: patientId,
      })
      .lean();

    // Ensure the email and phone fields are decrypted
    expect(patient.email).toEqual(patientData.email);
    expect(patient.email).not.toBeUndefined;
    expect(patient.phone).not.toBeUndefined;
  });

  test('Try to find a patient with a plain decrypt email', async () => {
    // Try to find a patient with a plain decrypt email
    const patient: IPatient = await patientModel
      .findOne({
        email: patientData.email,
      })
      .lean();

    // Ensure the patient is null
    expect(patient).toBeNull;
  });

  test('Find all patients and verify decrypted email and phone for each', async () => {
    // Find all patients and get an array of raw JSON objects (lean)
    const patients: IPatient[] = await patientModel.find().lean();

    // Ensure there is only one patient in the collection
    expect(patients).toHaveLength(1);

    // Verify decrypted email and phone for each patient
    for (let i = 0, len = patients.length; i < len; i++) {
      const patient = patients[i];
      expect(patient.name).toEqual(patientData.name);
      expect(patient.email).toEqual(patientData.email);
      expect(patient.phone).toEqual(patientData.phone);
    }
  });

  test('Find all patients, select email field, skip 0, limit 10, and verify decrypted email', async () => {
    // Find all patients, select only the email field, skip 0, limit 10, and get an array of raw JSON objects (lean)
    const patients: IPatient[] = await patientModel
      .find()
      .select('email')
      .skip(0)
      .limit(10)
      .lean();

    // Ensure there is only one patient in the collection
    expect(patients).toHaveLength(1);

    // Verify the email field is decrypted while the name and phone fields remain encrypted
    for (let i = 0, len = patients.length; i < len; i++) {
      const patient = patients[i];
      expect(patient.name).not.toEqual(patientData.name);
      expect(patient.email).toEqual(patientData.email);
      expect(patient.phone).not.toEqual(patientData.phone);
    }
  });

  test('Find all patients, select email field, skip 1, limit 10, and ensure no patients found', async () => {
    // Find all patients, select only the email field, skip 1, limit 10, and get an array of raw JSON objects (lean)
    const patients: IPatient[] = await patientModel
      .find()
      .select('email')
      .skip(1)
      .limit(10)
      .lean();

    // Ensure no patients were found as there is only one patient in the collection
    expect(patients).toHaveLength(0);
  });

  test('Aggregate to find a patient by id, project only email, skip 0, and limit 10', async () => {
    // Perform an aggregate query to find the patient by id, project only the email field, skip 0, and limit 10
    const patients: IPatient[] = await patientModel.aggregate([
      {
        $match: {
          _id: patientId,
        },
      },
      {
        $project: {
          _id: 0,
          email: 1,
        },
      },
      { $limit: 10 },
      { $skip: 0 },
    ]);

    // Ensure there is only one patient in the result set
    expect(patients).toHaveLength(1);

    // Verify the email field is decrypted while the name and phone fields remain decrypted
    for (let i = 0, len = patients.length; i < len; i++) {
      const patient = patients[i];
      expect(patient.email).toEqual(patientData.email);
      expect(patient.name).not.toBeUndefined;
      expect(patient.phone).not.toBeUndefined;
    }
  });

  test("Update a patient's phone number and verify the updated value", async () => {
    // Update a patient's phone number
    await patientModel.updateOne(
      {
        _id: patientId,
      },
      {
        phone: '+8801770964629',
      },
    );

    // Find the updated patient and verify the new phone number
    const patient: IPatient = await patientModel
      .findOne({
        _id: patientId,
      })
      .lean();

    // Ensure the email remains decrypted and the phone number is updated
    expect(patient.email).toEqual(patientData.email);
    expect(patient.phone).toEqual('+8801770964629');
  });

  test('Find a patient by id, update the phone number, and verify the updated value', async () => {
    // Find the patient by id, update the phone number, and return the updated document
    const patient: IPatient = await patientModel.findOneAndUpdate(
      {
        _id: patientId,
      },
      {
        phone: patientData.phone,
      },
      {
        new: true,
      },
    );

    // Ensure the email and phone fields are decrypted and the phone number is updated
    expect(patient.email).toEqual(patientData.email);
    expect(patient.phone).toEqual(patientData.phone);
  });

  test('Find a patient by id, update the email, and verify the updated value', async () => {
    // Find the patient by id, update the email, and return the updated document
    const patient: IPatient = await patientModel
      .findOneAndUpdate(
        {
          _id: patientId,
        },
        {
          email: 'ismailhosen1061@gmail.com',
        },
        {
          new: true,
        },
      )
      .select('email');

    // Ensure the email is updated and not equal to the original patientData email
    expect(patient.email).not.toEqual(patientData.email);
  });

  test('Find a patient by id, update the phone and isJestTestMock fields, and verify the updated values and encryption', async () => {
    // Find the patient by id, update the phone and isJestTestMock fields, and return the updated document
    const patient: IPatient = await patientModel
      .findOneAndUpdate(
        {
          _id: patientId,
        },
        {
          phone: patientData.phone,
          isJestTestMock: true, // Just use it for testing purposes.
        },
        {
          new: true,
        },
      )
      .lean();

    // Verify that the email and phone fields are encrypted
    expect(patient.email).toHaveLength(97); // Don't modify this value or the patientData email address.
    expect(patient.phone).toHaveLength(65); // Don't modify this value or the patientData phone number.

    // Ensure the email and phone fields are not equal to the original patientData email and phone
    expect(patient.email).not.toEqual(patientData.email);
    expect(patient.phone).not.toEqual(patientData.phone);
  });

  test('Insert multiple patients and verify encrypted email and phone for one of the patients', async () => {
    // Insert multiple patients, one with modified email, and return the array of inserted documents
    const patients: IPatient[] = await patientModel.insertMany([
      patientData,
      {
        ...patientData,
        email: 'ismailhosen1061@gmail.com',
        isJestTestMock: true, // Just use it for testing purposes.
      },
    ]);

    // Ensure two patients were inserted
    expect(patients).toHaveLength(2);

    // Verify that the second patient's email and phone fields are encrypted
    expect(patients[1].email).toHaveLength(97); // Don't modify this value or the patientData email address.
    expect(patients[1].phone).toHaveLength(65); // Don't modify this value or the patientData phone number.

    // Ensure the second patient's email and phone fields are not equal to the original patientData email and phone
    expect(patients[1].email).not.toEqual(patientData.email);
    expect(patients[1].phone).not.toEqual(patientData.phone);
  });
});
