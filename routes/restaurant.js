const express = require("express");
const { body } = require("express-validator");

const restaurantController = require("../controller/restaurant");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post(
  "/restaurant",
  isAuth,
  [body("name").trim().not().isEmpty()],
  restaurantController.createRestaurant
);

router.get("/allRestaurants", restaurantController.getAllRestarants);
router.get("/restaurant/:id", restaurantController.getRestaurant);
router.get(
  "/getRestaurantByUniqueName/:id",
  restaurantController.getRestaurantByUniqueName
);
router.post(
  "/filterByCuisine",
  restaurantController.filterRestaurantsByCuisine
);

router.post("/nearRestaurants", restaurantController.getNearRestarants);
router.put("/restaurant/:id", isAuth, restaurantController.updateRestaurant);
router.delete("/restaurant/:id", isAuth, restaurantController.deleteRestaurant);

module.exports = router;
