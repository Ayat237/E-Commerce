import { couponChangeLogModel, couponModel, userModel } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";
/**
 * @api { POST } /coupon/add   --create new coupon
 */
export const createCoupon = async (req, res, next) => {
  const { couponCode, couponAmount, couponType, from, till, users } = req.body;

  // Validate coupon code and amount
  const couponCodeExist = await couponModel.findOne({ couponCode });
  if (couponCodeExist) {
    return next(
      new ErrorClass(
        "Coupon code already exists",
        400,
        "Coupon code already exists"
      )
    );
  }

  const userIds = users.map((u) => u.userId);
  const validUsers = await userModel.find({ _id: { $in: userIds } });
  if (validUsers.length !== userIds.length) {
    return next(new ErrorClass("Invalid user(s)", 400, "Invalid user(s)"));
  }
  // Create new coupon and save it to the database
  const newCoupon = new couponModel({
    couponCode,
    couponAmount,
    couponType,
    from,
    till,
    users,
    createdBy: req.authUser._id,
  });

  await newCoupon.save();
  // Return the newly created coupon
  res.status(201).json({
    status: "success",
    message: "Coupon created successfully",
    data: newCoupon,
  });
};

/**
 * @api { GET } /coupon   --Get all coupons
 */
export const getAllCoupons = async (req, res, next) => {
  const { isEnabled } = req.query;
  let queryFilter = {};
  if (isEnabled) {
    queryFilter.isEnabled = isEnabled === "true" ? true : false;
  }
  const coupons = await couponModel.find(queryFilter);
  res.status(200).json({
    status: "success",
    data: coupons,
  });
};

/**
 * @api { GET } /coupon/:couponId   --Get coupon by couponId
 */

export const getCouponById = async (req, res, next) => {
  const { couponId } = req.params;
  const coupon = await couponModel.findById(couponId);
  if (!coupon) {
    return next(new ErrorClass("Coupon not found", 404, "Coupon not found"));
  }
  res.status(200).json({
    status: "success",
    data: coupon,
  });
};

/**
 * @api { PUT } /coupon/update/:couponId   --update the coupon
 */
export const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const  userId  = req.authUser._id;
  const { couponCode, couponAmount, couponType, from, till, users } = req.body;

  const coupon = await couponModel.findById(couponId);
  if (!coupon) {
    return next(new ErrorClass("Coupon not found", 404, "Coupon not found"));
  }

  const logChanges = { couponId, createdBy : userId, changes: {} };
  if (couponCode) {
    const couponCodeExist = await couponModel.findOne({ couponCode });
    if (couponCodeExist) {
      return next(
        new ErrorClass(
          "Coupon code already exists",
          400,
          "Coupon code already exists"
        )
      );
    }
    coupon.couponCode = couponCode;
    logChanges.changes.couponCode = couponCode;
  }

  if (couponAmount) {
    coupon.couponAmount = couponAmount;
    logChanges.changes.couponAmount = couponAmount;
  }

  if (couponType) {
    coupon.couponType = couponType;
    logChanges.changes.couponType = couponType;
  }

  if (from) {
    coupon.from = from;
    logChanges.changes.from = from;
  }

  if (till) {
    coupon.till = till;
    logChanges.changes.till = till;
  }

  if (users) {
    const userIds = users.map((u) => u.userId);
    const validUsers = await userModel.find({ _id: { $in: userIds } });
    if (validUsers.length !== userIds.length) {
      return next(new ErrorClass("Invalid user(s)", 400, "Invalid user(s)"));
    }
    coupon.users = users;
    logChanges.changes.users = users;
  }
  // Save changes to the database
  await coupon.save();
  const  log = await new couponChangeLogModel(logChanges).save();

  res.status(200).json({
    status: "success",
    message: "Coupon updated successfully",
    data: coupon,
    logChanges : log
  });
};


/**
 * @api { PATCH } /coupon/DisEn/:couponId   --Enable & Disable  coupon
 */

export const disableEnableCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const  userId  = req.authUser._id;
  const { enable } = req.body;
  
  const coupon = await couponModel.findById(couponId);
  if (!coupon) {
    return next(new ErrorClass("Coupon not found", 404, "Coupon not found"));
  }

  const logChanges = { couponId, createdBy : userId, changes: {} };
  if (enable === true) {
    coupon.isEnabled = true;
    logChanges.changes.isEnabled = true;
  }
  if (enable === false) {
    coupon.isEnabled = false;
    logChanges.changes.isEnabled = false;
  }
  
  // Save changes to the database
  await coupon.save();
  const  log = await new couponChangeLogModel(logChanges).save();

  res.status(200).json({
    status: "success",
    message: enable? "Coupon enabled successfully" : "Coupon disabled successfully",
    data: coupon,
    logChanges : log
  });
};
