
# mongoose-encryption-decryption

  

[![npm version](https://img.shields.io/npm/v/mongoose-encryption-decryption.svg)](https://www.npmjs.com/package/mongoose-encryption-decryption)

[![License](https://img.shields.io/npm/l/mongoose-encryption-decryption.svg)](https://github.com/ismail-bs/mongoose-encryption-decryption/blob/main/LICENSE)

  

## Overview

  

The "mongoose-encryption-decryption" package is a powerful and secure encryption and decryption solution specially designed for seamless integration with Mongoose, a popular MongoDB object modeling tool. It addresses the critical need for safeguarding sensitive data within Mongoose models, ensuring data integrity, confidentiality, and regulatory compliance.

  

**Key Advantages:**

  

-  **Data Protection Made Easy:** Easily secure sensitive data within your Mongoose models without the need for extensive code modifications or complicated encryption setups. By leveraging this package, developers can focus on building robust applications while ensuring data privacy.

-  **Versatile Encryption Support:** The package offers robust encryption using strong cryptographic algorithms. It supports various encryption standards, ensuring compatibility with a wide range of security protocols and compliance requirements.

-  **Transparent Integration:** The integration process is seamless, requiring minimal code changes. Developers can enable encryption for selected fields with a simple plugin configuration, making it convenient to adapt to specific use cases.

-  **Performance Optimized:** The package employs efficient encryption and decryption algorithms, designed to minimize performance overhead. With careful optimization, it ensures that data security does not come at the cost of application speed.

-  **Selective Encryption:** Tailor encryption to meet your application's needs. The package allows you to choose specific fields to be encrypted, enabling you to prioritize securing sensitive information while leaving other non-sensitive fields untouched.

-  **Comprehensive Middleware Support:** The package integrates smoothly with Mongoose middleware functions, including pre and post hooks. This ensures that encryption and decryption processes are applied consistently across various Mongoose operations.

-  **Flexibility and Scalability:** Whether you are building a small-scale application or a large enterprise-grade solution, "mongoose-encryption-decryption" scales effectively. It adapts to evolving requirements, making it suitable for a wide range of projects.

  
  

## Installation

  

Install the package from npm:

  

```bash
npm  install  mongoose-encryption-decryption
```

  

## Usage

  
```bash
import { Schema, model } from 'mongoose';
import { mongooseEncryptionDecryption } from 'mongoose-encryption-decryption';

const MySchema = new Schema(
  {
    sensitiveField: String,
    otherField: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Apply encryption to the specified fields
MySchema.plugin(mongooseEncryptionDecryption, {
  encodedFields: ['sensitiveField'],
  privateKey: 'your-secret-key',
});

const MyModel = model('MyModel', MySchema);

  ```
  

**Important Note:**

  

- This package is not a substitute for other security measures like input validation and access controls. It complements existing security practices and aims to enhance data protection specifically at the database level.

  
  ## MongoDB Supported Methods
  - create
  - save
  - insertOne
  - insertMany
  - find
  - findById
  - findOne
  - findOneAndUpdate
  - findOneAndDelete
  - findOneAndRemove
  - findByIdAndUpdate
  - findByIdAndDelete
  - findByIdAndRemove
  - deleteOne
  - updateOne
  - updateMany
  - aggregate
  

## Security Recommendation

  

- Choose strong and unique private keys for each use case to ensure maximum security and avoid using hardcoded keys in production environments.

  

**Intuitive Usage:**

  

To get started, simply install the package via npm and configure it as a plugin for your Mongoose schemas. By providing the appropriate private key and specifying the fields to encrypt, your sensitive data will be automatically encrypted upon saving and decrypted when queried, providing robust data protection with minimal effort.

  

**Security First:**

  

The "mongoose-encryption-decryption" package is developed with a security-first approach. While it ensures data protection at the database level, it is essential to remember that security is a multi-layered process. Alongside this package, it is recommended to follow best practices for authentication, access controls, and input validation to build a comprehensive security strategy.

  

## License

  

This package is provided under the [MIT License](https://opensource.org/licenses/MIT), granting users the freedom to use, modify, and distribute the software as permitted by the license terms.

  

## Support and Contribution

  

- For support, bug reporting, or feature suggestions, please visit our GitHub repository: [Github](https://github.com/ismail-bs/mongoose-encryption-decryption).

- We welcome community contributions to improve the package and encourage responsible disclosures for any security-related concerns.

  

## Acknowledgments

  

- We express our gratitude to the Mongoose community and the open-source contributors for their invaluable contributions to this project.

  

## Version History

  

- v1.0.0: Initial release with basic encryption and decryption functionality.

  

## About the Author

  

The "mongoose-encryption-decryption" package is developed and maintained by Md Ismail Hosen. We are a team of passionate developers with expertise in data security and software engineering. Our mission is to build tools that empower developers to create secure and privacy-respecting applications.

  

**Note:**

  

- Please refer to the package documentation for detailed usage instructions, code examples, and advanced configurations. Your feedback and support are essential to the project's growth and improvement. Thank you for choosing "mongoose-encryption-decryption" to enhance the security of your Mongoose applications. Happy coding!