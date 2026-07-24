import userAuthRoutes from "./userroutes.js";
import addressRoutes from "./addressRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import brandRoutes from "./brandRoutes.js";
import productRoutes from "./productRoutes.js";

import publicRoutes from "./publicRoutes.js";
import wishlistRoutes from "../routes/wishlistRoutes.js";
import cartRoutes from "./cartRoutes.js"
import orderRoutes from "./orderRoutes.js";
 import paymentRoutes from "./paymentRoutes.js";
const routes = (app) => {

  // User APIs
  app.use("/api/v1/user/auth", userAuthRoutes);

  app.use("/api/v1/user/address", addressRoutes);

  app.use("/api/v1/user/wishlist", wishlistRoutes);

 app.use("/api/v1/user/cart", cartRoutes);
 app.use("/api/v1/user/orders",orderRoutes);


  // Admin APIs
  app.use("/api/v1/admin/categories", categoryRoutes);
  app.use("/api/v1/admin/brands", brandRoutes);
  app.use("/api/v1/admin/products", productRoutes);

  // Public APIs
  app.use("/api/v1/public", publicRoutes);


  app.use("/api/v1/payment",paymentRoutes);
};

export default routes;