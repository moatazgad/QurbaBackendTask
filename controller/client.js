const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Client = require("../models/client");
const Restaurant = require("../models/restaurant");

//contain all business logic
exports.signup = (req, res, next) => {
  // next from middelware
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const phone = req.body.phone;
  const favoriteCuisines = req.body.favoriteCuisines;
  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const client = new Client({
        email: email,
        password: hashedPw,
        name: name,
        phone: phone,
        favoriteCuisines: favoriteCuisines,
      });
      return client.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "User created!",
        user_id: result._id,
        client: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  Client.findOne({
    email: email,
  })
    .then((client) => {
      if (!client) {
        const error = new Error("A user with this email could not be found.");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = client;
      return bcrypt.compare(password, client.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password!");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          user_id: loadedUser._id.toString(),
        },
        "somesupersecretsecret",
        {
          expiresIn: "1h",
        }
      );
      console.log("token", token);
      res.status(200).json({
        token: token,
        user_id: loadedUser._id.toString(),
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUsers = (req, res, next) => {
  Client.find()
    .then((users) => {
      res.status(200).json({
        message: "Fetched clients successfully.",
        users: users,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// Couldnot use the next function as $in is not supported in the atlas tier I an using
exports.getUsersWithCertainCuisines = (req, res, next) => {
  Client.aggregate([
    // Stage 1: Filter pizza order documents by pizza size
    {
      $in: [req.body.cuisine, "$favCuisines"],
    },
    // Stage 2: Group remaining documents by pizza name and calculate total quantity
    // {
    //    $group: { _id: "$name", totalQuantity: { $sum: "$quantity" } }
    // }
  ])
    .then((users) => {
      res.status(200).json({
        message: "Fetched clients successfully.",
        users: users,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUsersWithCertainCuisinesTwo = (req, res, next) => {
  Client.find({
    favoriteCuisines: req.body.cuisine,
  })
    .then((users) => {
      res.status(200).json({
        message: "Fetched clients successfully.",
        users: users,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
