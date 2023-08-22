import * as crypto from 'crypto';
import { cryptoConfig } from './config';

export class Helper {
  /**
   * Generates a random salt.
   * @returns {Buffer}
   */
  static saltGenerator = (): Buffer => crypto.randomBytes(16);

  /**
   * Hashes the provided private key.
   * @param {string} privateKey
   * @returns {string}
   */
  static hashPrivateKey = (privateKey: string): string =>
    crypto
      .createHash(cryptoConfig.hashAlgorithm)
      .update(privateKey)
      .digest('hex')
      .substring(0, 32);

  /**
   * Encrypts the provided plain text.
   * @param {string} plainTxt
   * @param {crypto.CipherKey} secretKey
   * @returns {string}
   */
  static encrypt = function (
    plainTxt: string,
    secretKey: crypto.CipherKey,
  ): string {
    try {
      // Generate a random initialization vector (IV)
      const iv = Helper.saltGenerator();

      // Create a cipher instance with the provided algorithm, secret key, and IV
      const cipher = crypto.createCipheriv(
        cryptoConfig.algorithm,
        secretKey,
        iv,
      );

      // Encrypt the plain text
      const encrypted = cipher.update(plainTxt);
      const finalBuffer = Buffer.concat([encrypted, cipher.final()]);

      // Return the encrypted text with IV as a delimiter
      return (
        iv.toString('hex') +
        cryptoConfig.ivDividerSign +
        finalBuffer.toString('hex')
      );
    } catch (error) {}
  };

  /**
   * Encrypts specified nested fields within the provided data object
   * @param {Object} data
   * @param {string[]} fields
   * @param {crypto.CipherKey} secretKey
   * @returns {void}
   */
  static encryptNestedFields = (
    data: { [x: string]: any },
    fields: string[],
    secretKey: crypto.CipherKey,
  ): void => {
    try {
      for (const field of fields) {
        const nestedFields = field.split('.'); // Split nested field path
        let value = data;

        // Traverse through nested fields except for the last one
        for (let i = 0; i < nestedFields.length - 1; i++) {
          value = value[nestedFields[i]];
        }

        // Check that the value isn't empty, undefined, or null.
        if (value ?? '' !== '') {
          const lastField = nestedFields[nestedFields.length - 1];
          // Encrypt the value of the last nested field
          value[lastField] = this.encrypt(value[lastField], secretKey);
        }
      }
    } catch (error) {}
  };

  /**
   * Decrypts the provided encrypted text using the provided secret key.
   * @param {string} encryptedTxt
   * @param {crypto.CipherKey} secretKey
   * @returns {string}
   */
  static decrypt = (
    encryptedTxt: string,
    secretKey: crypto.CipherKey,
  ): string => {
    // Split the encrypted text into initialization vector (IV) and encrypted data
    const [ivHex, encryptedDataHex] = encryptedTxt.split(
      cryptoConfig.ivDividerSign,
    );
    // Check if the initialization vector and encrypted data are present
    if (!(ivHex ?? '' !== '') || !(encryptedDataHex ?? '' !== '')) return;

    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedDataHex, 'hex');
    const decipher = crypto.createDecipheriv(
      cryptoConfig.algorithm,
      secretKey,
      iv,
    );
    const decrypted = decipher.update(encrypted);

    // Concatenate the decrypted buffer with the final block and convert to string
    return Buffer.concat([decrypted, decipher.final()]).toString();
  };

  /**
   * Decrypts specified nested fields within the provided data object.
   * @param {Object} data
   * @param {string[]} fields
   * @param {crypto.CipherKey} secretKey
   * @returns {void}
   */
  static decryptNestedFields = (
    data: { [x: string]: any },
    fields: string[],
    secretKey: crypto.CipherKey,
  ): void => {
    try {
      for (const field of fields) {
        const nestedFields = field.split('.'); // Split nested field path

        // Initialize variables to track current levels of nested objects
        let value = data;
        let nestedValue = value;

        // Traverse through nested fields except for the last one
        for (let i = 0; i < nestedFields.length - 1; i++) {
          value = value[nestedFields[i]];
          nestedValue = nestedValue[nestedFields[i]];
        }

        // Check if the current nested field exists and is not empty
        if (
          (value ?? '' !== '') &&
          value[nestedFields[nestedFields.length - 1]]
        ) {
          const lastField = nestedFields[nestedFields.length - 1];
          // Decrypt the value of the last nested field
          value[lastField] = this.decrypt(value[lastField], secretKey);
        }
      }
    } catch (error) {}
  };

  /**
   * Decrypts all fields in an array of objects.
   * @param {Object[]} data - Array of objects to be decrypted.
   * @param {string[]} fields - Fields to be decrypted within each object.
   * @param {crypto.CipherKey} secretKey - Secret key for decryption.
   * @returns {void}
   */
  static decryptArrayFields = (
    data: any[],
    fields: string[],
    secretKey: crypto.CipherKey,
  ): void => {
    // Loop through each object in the array
    for (let i = 0, len = data.length; i < len; i++) {
      // Use "data?.isJestTestMock" for testing purposes.
      if (!data[i]?.isJestTestMock) {
        // Decrypt the fields within the current object
        this.decryptNestedFields(data[i], fields, secretKey);
      }
    }
  };

  /**
   * Returns the appropriate "next" function based on the provided parameters
   * @param {Function | Object | undefined} next
   * @param {Object | Object | undefined} data
   * @returns {Function | Object | Error}
   */
  static getNextFunction = (next: any, data?: any): any => {
    switch (true) {
      // If next is already a function, return it
      case typeof next === 'function':
        return next;

      // If next is an object and data is a function, return data
      case typeof next === 'object' && typeof data === 'function':
        return data;

      // If none of the above conditions match, return a default error handler
      default:
        return (error: Error) => {
          if (error) {
            throw error;
          }
        };
    }
  };

  /**
   * The data object is obtained using the getData function.
   * @param {Function | Object} next
   * @param {Object} data
   * @returns {Object | Function}
   */
  static getData = (next: any, data: any): any => {
    // If data is not provided or if "next" is an object, return "next"
    if (!data || typeof next === 'object') {
      return next;
    }
    // Otherwise, return the provided "data" object
    return data;
  };

  /**
   * Obtains both the "next" function and the data object.
   * @param {Function | Object} next
   * @param {Object} data
   * @returns {Object} An object containing "next" and "data"
   */
  static getNextAndData = (_next: any, _data: any): any => {
    // Return an object containing both "next" and "data"
    return {
      next: this.getNextFunction(_next, _data),
      data: this.getData(_next, _data),
    };
  };
}
