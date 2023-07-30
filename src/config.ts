const {
    ALGORITHM,
    HASH_ALGORITHM,
    IV_DIVIDER_SIGN
} = process.env;
  
export const cryptoConfig = {
    algorithm: ALGORITHM || 'aes-256-cbc',
    hashAlgorithm: HASH_ALGORITHM || 'sha256',
    ivDividerSign: IV_DIVIDER_SIGN || '@',
};
  