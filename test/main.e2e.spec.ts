import * as crypto from 'crypto';
import { Helper } from 'src/helper';

describe('Encryption and Decryption Helper Functions', () => {
  let secretKey: crypto.CipherKey;

  beforeAll(() => {
    // Generate a new random secret key before all test case
    secretKey = crypto.randomBytes(32);
  });

  test('Salt Generator', () => {
    const salt = Helper.saltGenerator();
    expect(salt.length).toBe(16);
  });

  test('Encrypt and Decrypt Text', () => {
    const plainText = 'Hello, this is a secret message';
    const encryptedText = Helper.encrypt(plainText, secretKey);
    const decryptedText = Helper.decrypt(encryptedText, secretKey);

    expect(decryptedText).toBe(plainText);
  });

  test('Encrypt and Decrypt Fields', () => {
    const obj = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'supersecret',
    };
    const fieldsToEncrypt = ['name', 'email', 'password'];

    Helper.encryptFields(obj, fieldsToEncrypt, secretKey);
    expect(obj.name).not.toBe('John Doe');
    expect(obj.email).not.toBe('john@example.com');
    expect(obj.password).not.toBe('supersecret');

    Helper.decryptFields(obj, fieldsToEncrypt, secretKey);
    expect(obj.name).toBe('John Doe');
    expect(obj.email).toBe('john@example.com');
    expect(obj.password).toBe('supersecret');
  });

  test('Encrypt and Decrypt Fields - Empty/Null Values', () => {
    const obj = {
      name: 'John Doe',
      email: '',
      password: null,
    };
    const fieldsToEncrypt = ['name', 'email', 'password'];

    Helper.encryptFields(obj, fieldsToEncrypt, secretKey);
    expect(obj.name).not.toBe('John Doe');
    expect(obj.email).toBe('');
    expect(obj.password).toBeNull();

    Helper.decryptFields(obj, fieldsToEncrypt, secretKey);
    expect(obj.name).toBe('John Doe');
    expect(obj.email).toBe('');
    expect(obj.password).toBeNull();
  });

  test('Decrypt Array Fields', () => {
    const data = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'supersecret1',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'supersecret2',
      },
    ];
    const fieldsToEncrypt = ['name', 'email', 'password'];

    Helper.encryptFields(data[0], fieldsToEncrypt, secretKey);
    Helper.encryptFields(data[1], fieldsToEncrypt, secretKey);

    Helper.decryptArrayFields(data, fieldsToEncrypt, secretKey);

    expect(data[0].name).toBe('John Doe');
    expect(data[0].email).toBe('john@example.com');
    expect(data[0].password).toBe('supersecret1');

    expect(data[1].name).toBe('Jane Smith');
    expect(data[1].email).toBe('jane@example.com');
    expect(data[1].password).toBe('supersecret2');
  });
});
