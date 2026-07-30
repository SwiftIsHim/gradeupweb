const bcrypt = require("bcryptjs");

/** @implements {import("../../domain/ports").PasswordHasher} */
const bcryptPasswordHasher = {
  hash(plain) {
    return bcrypt.hash(plain, 10);
  },
  verify(plain, hash) {
    return bcrypt.compare(plain, hash);
  },
};

module.exports = bcryptPasswordHasher;
