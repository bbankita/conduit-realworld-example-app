const { User } = require("../models");
const { bcryptHash } = require("./bcrypt");

// Ensures a known user exists for automated tests.
// Only runs when TEST_USER_EMAIL, TEST_USER_USERNAME and TEST_USER_PASSWORD are set.
const seedTestUser = async () => {
  const {
    TEST_USER_EMAIL: email,
    TEST_USER_USERNAME: username,
    TEST_USER_PASSWORD: password,
  } = process.env;
  if (!email || !username || !password) return;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log(`Test user "${email}" already exists.`);
    return;
  }

  await User.create({
    email,
    username,
    bio: null,
    image: null,
    password: await bcryptHash(password),
  });
  console.log(`Test user "${email}" created.`);
};

module.exports = seedTestUser;
