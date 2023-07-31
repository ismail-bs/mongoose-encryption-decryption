import * as crypto from 'crypto';
import { cryptoConfig } from './config';

export class Helper {
  /**
   * The saltGenerator function is used to generate a random salt.
   * @returns Buffer
   */
  static saltGenerator = (): Buffer => crypto.randomBytes(16);

  /**
   * The hashPrivateKey function is used to hash the private key.
   * @returns string
   */
  static hashPrivateKey = (privateKey: string): string =>
    crypto
      .createHash(cryptoConfig.hashAlgorithm)
      .update(privateKey)
      .digest('hex')
      .substring(0, 32);

  /**
   * The plain text is encrypted using the encrypt function.
   * @param {string} plainTxt
   * @param {crypto.CipherKey} secretKey
   * @returns {string}
   */
  static encrypt = function (
    plainTxt: string,
    secretKey: crypto.CipherKey,
  ): string {
    try {
      const iv = Helper.saltGenerator();
      const cipher = crypto.createCipheriv(
        cryptoConfig.algorithm,
        secretKey,
        iv,
      );
      const encrypted = cipher.update(plainTxt);
      const finalBuffer = Buffer.concat([encrypted, cipher.final()]);
      return (
        iv.toString('hex') +
        cryptoConfig.ivDividerSign +
        finalBuffer.toString('hex')
      );
    } catch (error) {}
  };

  /**
   * All schema-defined fields are encrypted using the encryptFields function.
   * @param { [x: string]: string } obj
   * @param {string[]} fields
   * @param {crypto.CipherKey} secretKey
   * @returns {void}
   */
  static encryptFields = (
    data: { [x: string]: string },
    fields: string[],
    secretKey: crypto.CipherKey,
  ): void => {
    try {
      for (let i = 0, len = fields.length; i < len; i++) {
        const field = fields[i];
        const plainTxt = data[field];
        // Check that the plainTxt isn't empty, undefined, or null.
        if (plainTxt ?? '' !== '')
          data[field] = this.encrypt(plainTxt, secretKey);
      }
    } catch (error) {}
  };

  /**
   * The decrypt function is used to decrypt the encrypted text.
   * @param {string} encryptedTxt
   * @param {crypto.CipherKey} secretKey
   * @returns {string}
   */
  static decrypt = (
    encryptedTxt: string,
    secretKey: crypto.CipherKey,
  ): string => {
    const [ivHex, encryptedDataHex] = encryptedTxt.split(
      cryptoConfig.ivDividerSign,
    );
    if (!(ivHex ?? '' !== '') || !(encryptedDataHex ?? '' !== '')) return;

    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedDataHex, 'hex');
    const decipher = crypto.createDecipheriv(
      cryptoConfig.algorithm,
      secretKey,
      iv,
    );
    const decrypted = decipher.update(encrypted);
    return Buffer.concat([decrypted, decipher.final()]).toString();
  };

  /**
   * All schema-defined fields are decrypted using the decryptFields function.
   * @param { [x: string]: string } obj
   * @param {string[]} fields
   * @param {crypto.CipherKey} secretKey
   * @returns {void}
   */
  static decryptFields = (
    data: { [x: string]: any },
    fields: string[],
    secretKey: crypto.CipherKey,
  ): void => {
    try {
      for (let i = 0, len = fields.length; i < len; i++) {
        const field = fields[i];
        const encryptedValue = data[field];
        // Check that the encryptedValue isn't empty, undefined, or null.
        if (encryptedValue ?? '' !== '') {
          const decryptValue = this.decrypt(encryptedValue, secretKey);
          data[field] = decryptValue ? decryptValue : encryptedValue || '';
        }
      }
    } catch (error) {}
  };

  /**
   * The function decryptArrayFields decrypts all data.
   * @param {Object} data
   * @param {string[]} fields
   * @param {crypto.CipherKey} secretKey
   * @returns {void}
   */
  static decryptArrayFields = (
    data: any,
    fields: string[],
    secretKey: crypto.CipherKey,
  ): void => {
    for (let i = 0, len = data.length; i < len; i++) {
      // "data?.isJestTestMock" Just use it for testing purposes.
      if (!data[i]?.isJestTestMock)
        this.decryptFields(data[i], fields, secretKey);
    }
  };

  /**
   * The next() function is obtained by calling the getNextFunction function.
   * @param {Function | Object | undefined} next
   * @param {Object | Object | undefined} data
   * @returns {Function | Object | Error}
   */
  static getNextFunction = (next: any, data?: any): any => {
    switch (true) {
      case typeof next === 'function':
        return next;
      case typeof next === 'object' && typeof data === 'function':
        return data;
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
    if (!data || typeof next === 'object') {
      return next;
    }
    return data;
  };

  /**
   * The data object is obtained using the getData function.
   * @param {Function | Object} next
   * @param {Object} data
   * @returns {Object | Function}
   */
  static getNextAndData = (_next: any, _data: any): any => {
    return {
      next: this.getNextFunction(_next, _data),
      data: this.getData(_next, _data),
    };
  };
}
