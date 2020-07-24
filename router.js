const Auhentication = require("./controllers/authentication");
const passportService = require("./services/passport");
const passport = require("passport");

const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignin = passport.authenticate("local", { session: false });

module.exports = function (app) {
  app.get("/", requireAuth, function (req, res) {
    res.send({
      message: "-- this is a secret message stright from the server",
    });
  });
  app.post("/signin", requireSignin, Auhentication.signin);
  app.post("/signup", Auhentication.signup);
};
