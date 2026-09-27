const express = require("express");
const UserController = require("./user.controller");
const authenticateToken = require("../../middlewares/authMiddleware");

const UserRouter = express.Router();
UserRouter.get("/me", authenticateToken, UserController.me);
UserRouter.patch("/me", authenticateToken, UserController.updateMe);
UserRouter.get("/:username", UserController.profile);

module.exports = UserRouter;
