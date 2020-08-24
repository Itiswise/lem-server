const Auhentication = require("./controllers/authentication");
const LineController = require("./controllers/line");
const UserController = require("./controllers/user");
const OrderController = require("./controllers/order");
const ScanController = require("./controllers/scan");
const BreakController = require("./controllers/break");
const MenuController = require("./controllers/xlsxSource");
const passportService = require("./services/passport");
const passport = require("passport");

const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignin = passport.authenticate("local", { session: false });

module.exports = function (app) {
  app.get("/", requireAuth, function (req, res) {
    res.send({
      message: "-- Hello from the inside of Riverdi LEM server",
      user: req.user,
    });
  });
  app.post("/signin", requireSignin, Auhentication.signin);
  app.post("/signup", Auhentication.signup);
  app.post("/api/line", requireAuth, LineController.addLine);
  app.get("/api/lines", requireAuth, LineController.getLines);
  app.put("/api/line/status", requireAuth, LineController.changeStatus);
  app.post("/api/user", requireAuth, UserController.addUser);
  app.post("/api/order", requireAuth, OrderController.addOrder);
  app.put("/api/order/close", requireAuth, OrderController.closeOrder);
  app.get("/api/orders", requireAuth, OrderController.getOrders);
  app.get(
    "/api/order/:dashedordernumber",
    requireAuth,
    OrderController.getOrder
  );
  app.delete(
    "/api/order/:dashedordernumber",
    requireAuth,
    OrderController.deleteOrder
  );
  app.post("/api/scan", requireAuth, ScanController.addScan);
  app.post("/api/menu", requireAuth, MenuController.updateMenu);
  app.get("/api/menu", requireAuth, MenuController.getMenu);
  app.post("/api/break/start", requireAuth, BreakController.addBreakStart);
  app.post("/api/break/end", requireAuth, BreakController.addBreakEnd);
};
