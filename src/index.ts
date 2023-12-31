import { Schema } from 'mongoose';
import { Helper } from './helper';

/**
 * The encryption and decryption processes are initiated by the mongooseEncryptionDecryption function.
 * @param {Schema} schema
 * @param {Object} options
 * @returns {void}
 */
export const mongooseEncryptionDecryption = function (
  schema: Schema,
  options: {
    privateKey: string;
    encodedFields: string[];
  },
): void {
  if (!options || !options.privateKey || !options.encodedFields) {
    throw new Error('Please provide the necessary options.');
  }
  const privateKey = Helper.hashPrivateKey(options.privateKey);
  const encodedFields = options.encodedFields || [];

  // ----------------------------------------------------------------
  //       Mongoose Middleware Functions (pre and post hooks)
  // ----------------------------------------------------------------

  function updatePreHook(_next: any) {
    const next = Helper.getNextFunction(_next);
    const updateObj: any = {}; // Initialize the update object

    for (const field of encodedFields) {
      const nestedFields = field.split('.');
      let nestedValue = this._update; // Keep track of the nested value

      // Traverse through nested fields except for the last one
      for (let i = 0; i < nestedFields.length - 1; i++) {
        nestedValue = nestedValue?.[nestedFields[i]];
      }

      // If the nestedValue is an object and the last field exists, encrypt it
      if (
        nestedValue &&
        typeof nestedValue === 'object' &&
        nestedValue[nestedFields[nestedFields.length - 1]]
      ) {
        const lastField = nestedFields[nestedFields.length - 1];
        const encryptedValue = Helper.encrypt(
          nestedValue[lastField],
          privateKey,
        );
        nestedValue[lastField] = encryptedValue;
      } else if (this._update?.[field]) {
        const encryptedData = Helper.encrypt(
          this._update[field] as string,
          privateKey,
        );
        updateObj[field] = encryptedData;
      }
    }

    if (Object.keys(updateObj).length > 0) {
      this.updateOne(this.getQuery() || {}, updateObj);
    }

    next();
  }

  function postInitHook(_next: any, _data: any) {
    if (!this._conditions) return; // Logic for findOne hook (find)

    const { next, data } = Helper.getNextAndData(_next, _data);
    if (!data) return next();

    Helper.decryptNestedFields(data, encodedFields, privateKey);
    next();
  }

  function preSaveHook(_next: any, documents: any) {
    const next = Helper.getNextFunction(_next);
    const data = this;

    if (documents.length) {
      for (let i = 0, len = documents.length; i < len; i++) {
        Helper.encryptNestedFields(documents[i], encodedFields, privateKey);
      }
    } else if (data) {
      Helper.encryptNestedFields(data, encodedFields, privateKey);
    }
    next();
  }

  function postSaveHook(_next: any, _data: any) {
    const { next, data } = Helper.getNextAndData(_next, _data);
    // "data?.isJestTestMock" Just use it for testing purposes.
    if (!data || data?.isJestTestMock) return next();

    data.length
      ? Helper.decryptArrayFields(data, encodedFields, privateKey)
      : Helper.decryptNestedFields(data, encodedFields, privateKey);

    next();
  }

  function findHook(_next: any, _data: any) {
    const { next, data } = Helper.getNextAndData(_next, _data);
    if (!data || data.length === 0) return next();

    Helper.decryptArrayFields(data, encodedFields, privateKey);
    next();
  }

  function findOneHook(_next: any, _data: any) {
    const { next, data } = Helper.getNextAndData(_next, _data);
    if (!data) return next();

    Helper.decryptNestedFields(data, encodedFields, privateKey);
    next();
  }

  function updatePostHook(_next: any, _data: any) {
    const { next, data } = Helper.getNextAndData(_next, _data);
    // "data?.isJestTestMock" Just use it for testing purposes.
    if (!data || data?.isJestTestMock) return next();

    // Determining whether the request has lean() or select() options
    if (this._userProvidedFields || this._mongooseOptions?.lean) {
      Helper.decryptNestedFields(data, encodedFields, privateKey);
    }
    next();
  }

  function aggregateHook(_next: any, _data: any) {
    const { next, data } = Helper.getNextAndData(_next, _data);
    if (!data) return next();

    Helper.decryptArrayFields(data, encodedFields, privateKey);
    next();
  }

  // ----------------------------------------------------------------
  //                Mongoose Middleware (pre & post hooks)
  // ----------------------------------------------------------------

  schema.pre('save', preSaveHook);
  schema.pre('insertMany', preSaveHook);
  schema.pre('findOneAndUpdate', updatePreHook);
  schema.pre('updateOne', updatePreHook);

  schema.post('init', postInitHook);
  schema.post('save', postSaveHook);
  schema.post('insertMany', postSaveHook);
  schema.post('updateOne', updatePostHook);
  schema.post('find', findHook);
  schema.post(
    ['findOne', 'findOneAndUpdate', 'findOneAndRemove', 'findOneAndDelete'],
    findOneHook,
  );
  schema.post('aggregate', aggregateHook);
};
