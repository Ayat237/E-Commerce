import { scheduleJob } from "node-schedule";
import { couponModel } from "../../DB/Models/index.js";
import { DateTime } from "luxon";

export const disableCoupons = () => {
  scheduleJob("0 59 23 * * *", async () => {
    console.log("cron job to disable coupons");
    const enabledCoupons = await couponModel.find({ isEnabled: true });

    if (enabledCoupons.length > 0) {
      for (const coupon of enabledCoupons) {
        if (DateTime.now() > DateTime.fromJSDate(coupon.till)) {
          coupon.isEnabled = false;
          await coupon.save();
          console.log(`Coupon ${coupon.couponCode} has expired.`);
        }
      }
    }
  });
};
