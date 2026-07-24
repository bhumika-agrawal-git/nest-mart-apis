
import Cart from "../models/Cart.js";
import Order from "../models/order.js";
import OrderItem from "../models/orderItem.js";
import Address from "../models/Address.js";

import { responseHandler } from "../utils/responseHandler.js";
import { getPagination } from "../utils/pagination.js";
import razorpay from "../configs/razorpay.js";


// =================================================
// GENERATE ORDER NUMBER
// ORDER001, ORDER002, ORDER003
// =================================================
const generateOrderNumber = async () => {
  const lastOrder = await Order.findOne({
    order_number: {
      $exists: true,
      $ne: null,
    },
  }).sort({
    createdAt: -1,
  });

  let nextNumber = 1;

  if (lastOrder?.order_number) {
    const lastNumber = parseInt(
      lastOrder.order_number
        .replace("ORDER", ""),
      10
    );

    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `ORDER${String(nextNumber).padStart(3, "0")}`;
};




// =================================================
// CREATE ORDER
// =================================================
export const createOrder = async (req, res) => {
  try {
    const user_id = req.user._id;

    const {
      address_id,
      cart_id,
      payment_method = "COD",
    } = req.body;

    // ---------------------------------------------
    // 1. VALIDATE CART ID
    // ---------------------------------------------
    if (!cart_id) {
      return responseHandler(
        res,
        400,
        false,
        "cart_id is required."
      );
    }

    // ---------------------------------------------
    // 2. CHECK ADDRESS
    // ---------------------------------------------
    const address = await Address.findOne({
      _id: address_id,
      user_id,
    });

    if (!address) {
      return responseHandler(
        res,
        404,
        false,
        "Address not found."
      );
    }

    // ---------------------------------------------
    // 3. GET ONLY SELECTED CART ITEM
    // ---------------------------------------------
    const cartItem = await Cart.findOne({
      _id: cart_id,
      user_id,
    }).populate("product_id");

    if (!cartItem) {
      return responseHandler(
        res,
        404,
        false,
        "Cart item not found."
      );
    }

    // ---------------------------------------------
    // 4. CHECK DELETED PRODUCT
    // ---------------------------------------------
    if (!cartItem.product_id) {
      return responseHandler(
        res,
        400,
        false,
        "Product is no longer available."
      );
    }

    // ---------------------------------------------
    // 5. CALCULATE PRICE
    // ---------------------------------------------
    const product = cartItem.product_id;

    const subtotal =
      product.price * cartItem.quantity;

    const discount = 0;
    const delivery_charge = 40;
    const tax = 0;

    const total_amount =
      subtotal -
      discount +
      delivery_charge +
      tax;

    // ---------------------------------------------
    // 6. GENERATE ORDER NUMBER
    // ---------------------------------------------
    const order_number =
      await generateOrderNumber();

    // =================================================
    // 7. CREATE RAZORPAY ORDER
    // =================================================
    let razorpay_order_id = null;

    if (payment_method === "ONLINE") {
      const razorpayOrder =
        await razorpay.orders.create({
          amount: Math.round(
            total_amount * 100
          ),

          currency: "INR",

          receipt: order_number,

          notes: {
            order_number,
            user_id: user_id.toString(),
            cart_id: cart_id.toString(),
          },
        });

      razorpay_order_id =
        razorpayOrder.id;
    }

    // =================================================
    // 8. CREATE ORDER IN DATABASE
    // =================================================
    const order = await Order.create({

      order_number,

      user_id,

      user_details: {
        first_name:
          req.user.first_name,

        last_name:
          req.user.last_name,

        email:
          req.user.email,

        phone_no:
          req.user.phone_no,
      },

      address_id,

      address_details: {
        full_name:
          address.full_name,

        phone_no:
          address.phone_no,

        address_line:
          address.address_line_1,

        city:
          address.city,

        state:
          address.state,

        pincode:
          address.pincode,
      },

      finance_details: {
        subtotal,

        discount,

        delivery_charge,

        tax,

        total_amount,
      },

      payment_details: {
        payment_method,

        payment_status: "PENDING",

        razorpay_order_id,

        razorpay_payment_id: null,
      },

      order_status: "PENDING",
    });

    // =================================================
    // 9. CREATE ONLY SELECTED ORDER ITEM
    // =================================================
    const orderItem = {
      order_id: order._id,

      cart_id: cartItem._id,

      product_id: product._id,

      product_name:
        product.product_name,

      price:
        product.price,

      quantity:
        cartItem.quantity,

      total_price:
        product.price *
        cartItem.quantity,
    };

    // ---------------------------------------------
    // 10. SAVE ORDER ITEM
    // ---------------------------------------------
    await OrderItem.create(
      orderItem
    );

    // ---------------------------------------------
    // 11. DELETE ONLY SELECTED CART ITEM
    // ---------------------------------------------
    await Cart.deleteOne({
      _id: cart_id,
      user_id,
    });

    // ---------------------------------------------
    // 12. RESPONSE
    // ---------------------------------------------
    return responseHandler(
      res,
      201,
      true,

      payment_method === "ONLINE"
        ? "Online order created successfully."
        : "COD order created successfully.",

      {
        order,

        items: [
          orderItem,
        ],

        ...(payment_method === "ONLINE" && {
          razorpay: {
            razorpay_order_id,

            amount:
              Math.round(
                total_amount * 100
              ),

            currency: "INR",
          },
        }),
      }
    );

  } catch (error) {

    console.error(
      "Create Order Error:",
      error
    );

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error",
      error.message
    );
  }
};

// =================================================
// GET ORDER HISTORY
// =================================================
// Shows only:
// Product Name
// Price
// Quantity
// Order Number
// =================================================
export const getOrderHistory = async (
  req,
  res
) => {

  try {

    const user_id =
      req.user._id;


    const {
      page,
      limit,
      skip,
    } =
      getPagination(req);


    // ---------------------------------------------
    // TOTAL ORDERS
    // ---------------------------------------------
    const totalRecords =
      await Order.countDocuments({
        user_id,
      });


    // ---------------------------------------------
    // GET ORDERS
    // ---------------------------------------------
    const orders =
      await Order.find({
        user_id,
      })
        .select(
          "order_number createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean();


    // ---------------------------------------------
    // GET ONLY PRODUCT DETAILS
    // ---------------------------------------------
    const ordersWithItems =
      await Promise.all(

        orders.map(
          async (order) => {

            const items =
              await OrderItem.find({
                order_id:
                  order._id,
              })
                .select(
                  "product_name price quantity -_id"
                )
                .lean();


            return {

              order_number:
                order.order_number,

              createdAt:
                order.createdAt,

              items,

            };

          }
        )

      );


    return responseHandler(
      res,
      200,
      true,
      "Orders fetched successfully.",
      ordersWithItems,
      {
        page,
        limit,
        totalRecords,
        totalPages:
          Math.ceil(
            totalRecords / limit
          ),
      }
    );


  } catch (error) {

    console.error(
      "Get Order History Error:",
      error
    );

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error",
      error.message
    );

  }

};


// =================================================
// GET ORDER BY ID
// =================================================
// Complete order information
// =================================================
export const getOrderById = async (
  req,
  res
) => {

  try {

    const user_id =
      req.user._id;


    const {
      order_id,
    } =
      req.params;


    // ---------------------------------------------
    // FIND ORDER
    // ---------------------------------------------
    const order =
      await Order.findOne({

        _id:
          order_id,

        user_id,

      })
        .populate(
          "user_id",
          "first_name last_name email phone_no"
        )
        .populate(
          "address_id"
        )
        .lean();


    if (!order) {

      return responseHandler(
        res,
        404,
        false,
        "Order not found."
      );

    }


    // ---------------------------------------------
    // GET ORDER ITEMS
    // ---------------------------------------------
    const items =
      await OrderItem.find({

        order_id:
          order._id,

      })
        .select(
          "product_name price quantity total_price -_id"
        )
        .lean();


    return responseHandler(
      res,
      200,
      true,
      "Order fetched successfully.",
      {

        ...order,

        items,

      }
    );


  } catch (error) {

    console.error(
      "Get Order By ID Error:",
      error
    );

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error",
      error.message
    );

  }

};


// =================================================
// CANCEL ORDER
// =================================================
export const cancelOrder = async (
  req,
  res
) => {

  try {

    const user_id =
      req.user._id;


    const {
      order_id,
    } =
      req.params;


    // ---------------------------------------------
    // FIND ORDER
    // ---------------------------------------------
    const order =
      await Order.findOne({

        _id:
          order_id,

        user_id,

      });


    if (!order) {

      return responseHandler(
        res,
        404,
        false,
        "Order not found."
      );

    }


    // ---------------------------------------------
    // CHECK STATUS
    // ---------------------------------------------
    const nonCancelableStatuses = [

      "SHIPPED",

      "DELIVERED",

      "CANCELLED",

    ];


    if (

      nonCancelableStatuses.includes(

        order.order_status

      )

    ) {

      return responseHandler(

        res,

        400,

        false,

        `Order cannot be cancelled because its status is ${order.order_status}.`

      );

    }


    // ---------------------------------------------
    // CANCEL ORDER
    // ---------------------------------------------
    order.order_status =
      "CANCELLED";


    // ---------------------------------------------
    // REFUND PAYMENT
    // ---------------------------------------------
    if (

      order.payment_details
        .payment_status ===
      "PAID"

    ) {

      order.payment_details
        .payment_status =
        "REFUNDED";

    }


    await order.save();


    return responseHandler(

      res,

      200,

      true,

      "Order cancelled successfully.",

      order

    );


  } catch (error) {

    console.error(

      "Cancel Order Error:",

      error

    );


    return responseHandler(

      res,

      500,

      false,

      "Internal Server Error",

      error.message

    );

  }

};