import Joi from "joi";
import { couponType } from "../../Utils/index.js";
import { generalRules } from "../../Utils/index.js";

export const createCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().required(),
    from: Joi.date().greater(Date.now()).required(),
    till: Joi.date().greater(Joi.ref("from")).required(),
    users: Joi.array().items(
      Joi.object({
        userId: generalRules.id.required(),
        maxCount: Joi.number().integer().min(1).required(),
        usageCount: Joi.number().integer().min(0).default(0),
      })
    ),
    couponType: Joi.string()
      .valid(...Object.values(couponType))
      .required(),
    couponAmount: Joi.number()
      .when("couponType", {
        is: Joi.string().valid(couponType.PERCENTAGE),
        then: Joi.number().min(1).max(100).required(),
      })
      .min(1)
      .required()
      .messages({
        "number.min": "Coupon amount must be greater than zero.",
        "number.max": "Coupon amount must be less than or equal to 100.",
        "any.required": "Coupon amount is required for percentage type.",
      }),
    isEnabled: Joi.boolean().optional(),
  }),
};

export const updateCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().optional(),
    from: Joi.date().greater(Date.now()).optional(),
    till: Joi.date().greater(Joi.ref("from")).optional(),
    users: Joi.array()
      .items(
        Joi.object({
          userId: generalRules.id.optional(),
          maxCount: Joi.number().integer().min(1).optional(),
          usageCount: Joi.number().integer().min(0).default(0),
        })
      )
      .optional(),
    couponType: Joi.string()
      .valid(...Object.values(couponType))
      .optional(),
    couponAmount: Joi.number()
      .when("couponType", {
        is: Joi.string().valid(couponType.PERCENTAGE),
        then: Joi.number().min(1).max(100).optional(),
      })
      .min(1)
      .optional()
      .messages({
        "number.min": "Coupon amount must be greater than zero.",
        "number.max": "Coupon amount must be less than or equal to 100.",
        "any.required": "Coupon amount is required for percentage type.",
      })
  }),
  params: Joi.object({
    couponId: generalRules.id.required(),
  }),
  authUser: Joi.object({
    _id: generalRules.id.required(),
  }).options({ allowUnknown: true }),
};



export const disableEnableCouponSchema = {
  body: Joi.object({
    enable : Joi.boolean().required(),
  }),
  params: Joi.object({
    couponId: generalRules.id.required(),
  }),
  authUser: Joi.object({
    _id: generalRules.id.required(),
  }).options({ allowUnknown: true }),
};