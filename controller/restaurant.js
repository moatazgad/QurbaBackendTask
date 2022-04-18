const { validationResult } = require("express-validator");

const Restaurant = require("../models/restaurant");
const Client = require("../models/client");

exports.getAllRestarants = (req, res, next) => {
  Restaurant.find()
    .then((Restaurants) => {
      res.status(200).json({
        message: "Fetched Restaurants successfully.",
        Restaurants: Restaurants,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createRestaurant = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const name = req.body.name;
  const uniqueName = req.body.uniqueName;
  const cuisine = req.body.cuisine;
  const location = req.body.location;
  let user;

  const restaurant = new Restaurant({
    name: name,
    uniqueName: uniqueName,
    cuisine: cuisine,
    location: location,
    user_id: req.user_id,
  });

  restaurant
    .save()
    .then((result) => {
      return Client.findById(req.user_id);
    })
    .then((client) => {
      console.log(client);
      user = client;
      client.restaurants.push(restaurant);
      return client.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Restaurant created successfully!",
        Restaurant: Restaurant,
        // user_id: user._id,
        user: {
          _id: user._id,
          name: user.name,
        },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getRestaurant = (req, res, next) => {
  const restaurantId = req.params.id;
  Restaurant.findById(restaurantId)
    .then((restaurant) => {
      if (!restaurant) {
        const error = new Error("Could not find restaurant.");
        error.statusCode = 404;
        throw error;
      }
      // if (restaurant.user_id.toString() !== req.user_id) {
      //   const error = new Error("Not authorized!");
      //   error.statusCode = 403;
      //   throw error;
      // }
      res
        .status(200)
        .json({ message: "restaurant fetched.", restaurant: restaurant });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getRestaurantByUniqueName = (req, res, next) => {
  const restaurantUniqueName = req.params.id;
  Restaurant.find({ uniqueName: restaurantUniqueName })
    .then((restaurant) => {
      if (restaurant.length == 0) {
        const error = new Error("Could not find restaurant.");
        error.statusCode = 404;
        throw error;
      }
      // if (restaurant.user_id.toString() !== req.user_id) {
      //   const error = new Error("Not authorized!");
      //   error.statusCode = 403;
      //   throw error;
      // }
      res
        .status(200)
        .json({ message: "restaurant fetched.", restaurant: restaurant });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.filterRestaurantsByCuisine = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const cuisine = req.body.cuisine;

  Restaurant.find({ cuisine: cuisine })
    .then((Restaurants) => {
      if (Restaurants.length == 0) {
        const error = new Error(
          "Could not find any restaurant with this cuisine."
        );
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: "Fetched Restaurants with " + cuisine + " successfully.",
        Restaurants: Restaurants,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getNearRestarants = (req, res, next) => {
  const location = req.body.location;

  Restaurant.find({
    location: {
      $geoWithin: {
        $centerSphere: [
          [location.coordinates[0], location.coordinates[1]],
          1000 / 6378.1,
        ],
      },
    },
  })
    .then((Restaurants) => {
      if (Restaurants.length == 0) {
        const error = new Error(
          "Could not find any restaurant near this area."
        );
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: "Fetched Restaurants successfully.",
        Restaurants: Restaurants,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  // 6378.1
};

exports.updateRestaurant = (req, res, next) => {
  const restaurantId = req.params.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const name = req.body.name;
  const uniqueName = req.body.uniqueName;
  const cuisine = req.body.cuisine;
  const location = req.body.location;

  Restaurant.findById(restaurantId)
    .then((restaurant) => {
      if (!restaurant) {
        const error = new Error("Could not find restaurant.");
        error.statusCode = 404;
        throw error;
      }
      if (restaurant.user_id.toString() !== req.user_id) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      restaurant.name = name;
      restaurant.uniqueName = uniqueName;
      restaurant.cuisine = cuisine;
      restaurant.location = location;

      return restaurant.save();
    })

    .then((result) => {
      res.status(200).json({
        message: "restaurant updated.",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteRestaurant = (req, res, next) => {
  const restaurantId = req.params.id;
  Restaurant.findById(restaurantId)
    .then((restaurant) => {
      if (!restaurant) {
        const error = new Error("Could not find restaurant.");
        error.statusCode = 404;
        throw error;
      }
      if (restaurant.user_id.toString() !== req.user_id) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      // Check logged in user
      return Restaurant.findByIdAndRemove(restaurantId);
    })
    .then((result) => {
      return Client.findById(req.user_id);
    })
    .then((user) => {
      user.restaurants.pull(restaurantId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted Restaurant." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
