const Auhentication = require("./controllers/authentication");
const Line = require("./controllers/line");
const UserController = require("./controllers/user");
const OrderController = require("./controllers/order");
const passportService = require("./services/passport");
const passport = require("passport");

const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignin = passport.authenticate("local", { session: false });

module.exports = function (app) {
  app.get("/", requireAuth, function (req, res) {
    res.send({
      message: "-- this is a secret message stright from the server, really",
      user: req.user,
    });
  });
  app.post("/signin", requireSignin, Auhentication.signin);
  app.post("/signup", Auhentication.signup);
  app.post("/api/lineadd", Line.addLine);
  app.post("/api/user", requireAuth, UserController.addUser);
  app.post("/api/order", requireAuth, OrderController.addOrder);
};
