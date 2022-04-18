const express = require("express");
const { body } = require("express-validator");

const Client = require("../models/client");
const clientController = require("../controller/client");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return Client.findOne({
          email: value,
        }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({
      min: 5,
    }),
    body("name").trim().not().isEmpty(),
  ],
  clientController.signup
);

router.post("/login", clientController.login);
router.get("/clients", clientController.getUsers);
router.get("/clientsCuisines", clientController.getUsersWithCertainCuisines);
router.post(
  "/clientsCuisinesTwo",
  clientController.getUsersWithCertainCuisinesTwo
);

module.exports = router;
