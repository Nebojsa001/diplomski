const bcrypt = require("bcryptjs");

const correctPassword = async (candidatePassword, userPassword) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = {
  correctPassword,
};
