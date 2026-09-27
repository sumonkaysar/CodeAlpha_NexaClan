const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
    },
    displayName: { type: String, required: true, trim: true, maxlength: 48 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    bio: { type: String, default: "", maxlength: 180 },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform: (_document, result) => {
    delete result.password;
    return result;
  },
});

module.exports = mongoose.model("User", userSchema);
