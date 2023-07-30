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
    for (let i = 0, len = encodedFields.length; i < len; i++) {
      const field = encodedFields[i];
      if (this._update[field]) {
        const updateObj = {};
        const encryptedData = Helper.encrypt(
          this._update[field] as string,
          privateKey,
        );
        updateObj[field] = encryptedData;
        this.updateOne(this.getQuery() || {}, updateObj);
      }
    }
    next();
  }

  function postInitHook(_next: any, _data: any) {
    const { next, data } = Helper.getNextAndData(_next, _data);
    if (!data) next();

    Helper.decryptFields(data, encodedFields, privateKey);
    next();
  }

  function preSaveHook(_next: any, documents: any) {
    const next = Helper.getNextFunction(_next);
    const data = this;

    if (documents.length) {
      for (let i = 0, len = documents.length; i < len; i++) {
        Helper.encryptFields(documents[i], encodedFields, privateKey);
      }
    } else if (data) {
      Helper.encryptFields(data, encodedFields, privateKey);
    }
    next();
  }

  function postSaveHook(_next: any, _data: any) {
    const { next, data } = Helper.getNextAndData(_next, _data);
    if (!data) next();

    data.length
      ? Helper.decryptArrayFields(data, encodedFields, privateKey)
      : Helper.decryptFields(data, encodedFields, privateKey);

    next();
  }

  function findHook(_next: any, _data: any) {
    const { next, data } = Helper.getNextAndData(_next, _data);
    if (!data || data.length === 0) next();

    Helper.decryptArrayFields(data, encodedFields, privateKey);
    next();
  }

  function findOneHook(_next: any, _data: any) {
    const { next, data } = Helper.getNextAndData(_next, _data);
    if (!data) next();

    Helper.decryptFields(data, encodedFields, privateKey);
    next();
  }

  function updatePostHook(_next: any, _data: any) {
    const { next, data } = Helper.getNextAndData(_next, _data);
    if (!data) next();

    // Determining whether the request has lean() or select() options
    if (this._userProvidedFields || this._mongooseOptions?.lean) {
      Helper.decryptFields(data, encodedFields, privateKey);
    }
    next();
  }

  function aggregateHook(_next: any, _data: any) {
    const { next, data } = Helper.getNextAndData(_next, _data);
    if (!data) next();

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
  schema.post('findOne', findOneHook);
  schema.post('aggregate', aggregateHook);
};
