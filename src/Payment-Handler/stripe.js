import Stripe from "stripe";
import { couponModel } from "../../DB/Models/index.js";
import { DiscountType, ErrorClass } from "../Utils/index.js";

export const createCheckoutSessions = async ({
  customer_email,
  metadata,
  discounts,
  line_items,
}) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const paymentData = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email,
    metadata,
    cancel_url: process.env.CANCEL_URL,
    success_url: process.env.SUCCESS_URL,
    discounts,
    line_items,
  });
  return paymentData;
};

// create stripe coupon
export const createCheckoutCoupon = async ({ couponId }) => {
  const findCoupon = await couponModel.findById(couponId);
  if (!findCoupon) {
    return next(
      new ErrorClass("couldn't find coupon", 400, "couldn't find coupon")
    );
  }

  let couponObject = {};
  if (findCoupon.couponType === DiscountType.FIXED) {
    couponObject = {
      name: findCoupon.couponCode,
      amount_off: findCoupon.couponAmount * 100,
      currency: "egp",
    };
  }

  if (findCoupon.couponType === DiscountType.PERCENTAGE) {
    couponObject = {
      name: findCoupon.couponCode,
      percent_off: findCoupon.couponAmount,
    };
  }
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const coupon = await stripe.coupons.create(couponObject);
  return coupon;
};

export const createPaymentMethod = async ({ token }) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: {
      token,
    },
  });
  return paymentMethod;
};

export const createPaymentIntent = async ({ amount, currency }) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const paymentMethod = await createPaymentMethod({ token: "tok_visa" });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
    payment_method: paymentMethod.id,
  });
  return paymentIntent;
};

export const retrievedPaymentIntent = async ({ paymentIntentId }) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent;
};

export const confirmIntent = async ({ paymentIntentId }) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const paymentDetails = await retrievedPaymentIntent({paymentIntentId});
  const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
    paymentIntentId,
    {
        payment_method: paymentDetails.payment_method,
  
    }
  );
  return confirmedPaymentIntent;
};


export const refundPayment = async({paymentIntentId})=>{
    const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

    const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
    return refund;
}