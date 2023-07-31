import { Schema } from 'mongoose';
import { mongooseEncryptionDecryption } from 'src/index';

// Create a test schema for the plugin setup test
const TestSchema = new Schema<any>(
  {
    field: String,
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

describe('mongooseEncryptionDecryption', () => {
  test('should throw an error if necessary options are missing', () => {
    expect(() => {
      mongooseEncryptionDecryption(TestSchema, {
        // privateKey and encodedFields are not provided, which should trigger an error
      } as any);
    }).toThrowError('Please provide the necessary options.');
  });

  test('should apply the plugin to the schema with valid options', () => {
    expect(() => {
      mongooseEncryptionDecryption(TestSchema, {
        privateKey: 'supersecret',
        encodedFields: ['field'],
      });
    }).not.toThrow();
  });

  test('should set up the correct middleware hooks in the schema', () => {
    const TestSchema = new Schema<any>({ field: String });
    const spyPreSave = jest.spyOn(TestSchema, 'pre');
    const spyPostInit = jest.spyOn(TestSchema, 'post');

    mongooseEncryptionDecryption(TestSchema, {
      privateKey: 'super',
      encodedFields: ['field'],
    });

    // Ensure the pre and post hooks are correctly set up for various operations
    expect(spyPreSave).toHaveBeenCalledTimes(4);
    expect(spyPreSave).toHaveBeenCalledWith('save', expect.any(Function));
    expect(spyPreSave).toHaveBeenCalledWith('insertMany', expect.any(Function));
    expect(spyPreSave).toHaveBeenCalledWith(
      'findOneAndUpdate',
      expect.any(Function),
    );
    expect(spyPreSave).toHaveBeenCalledWith('updateOne', expect.any(Function));

    expect(spyPostInit).toHaveBeenCalledTimes(7);
    expect(spyPostInit).toHaveBeenCalledWith('init', expect.any(Function));
    expect(spyPostInit).toHaveBeenCalledWith('save', expect.any(Function));
    expect(spyPostInit).toHaveBeenCalledWith(
      'insertMany',
      expect.any(Function),
    );
    expect(spyPostInit).toHaveBeenCalledWith('updateOne', expect.any(Function));
    expect(spyPostInit).toHaveBeenCalledWith('find', expect.any(Function));
    expect(spyPostInit).toHaveBeenCalledWith('findOne', expect.any(Function));
    expect(spyPostInit).toHaveBeenCalledWith('aggregate', expect.any(Function));
  });
});
