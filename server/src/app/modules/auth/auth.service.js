const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../user/user.model");

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const issueToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

const register = async ({ username, displayName, email, password }) => {
  const normalizedUsername =
    typeof username === "string" ? username.trim().toLowerCase() : "";
  if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
    throw createError(
      "Username must be 3-24 characters using letters, numbers, or underscores",
      400,
    );
  }
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw createError("Enter a valid email address", 400);
  }
  if (typeof password !== "string" || password.length < 8) {
    throw createError("Password must be at least 8 characters", 400);
  }
  const name =
    typeof displayName === "string" && displayName.trim()
      ? displayName.trim()
      : normalizedUsername;

  try {
    const user = await User.create({
      username: normalizedUsername,
      displayName: name,
      email: email.trim().toLowerCase(),
      password: await bcrypt.hash(password, 10),
    });
    return { token: issueToken(user), user };
  } catch (error) {
    if (error.code === 11000)
      throw createError("That username or email is already in use", 409);
    throw error;
  }
};

const login = async ({ email, password }) => {
  if (typeof email !== "string" || typeof password !== "string") {
    throw createError("Email and password are required", 400);
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createError("Invalid email or password", 401);
  }
  return { token: issueToken(user), user };
};

module.exports = { register, login };
