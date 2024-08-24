import { addressModel } from "../../../DB/Models/index.js";

/**
 * @api { POST } /address/Add -Adds a new address
 */
export const addAddress = async (req, res, next) => {
  // Destructuring the request body
  const {
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    setAsDefault,
  } = req.body;

  const userId = req.authUser._id;
  const newAddress = new addressModel({
    userId,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    isDefault: [true, false].includes(setAsDefault) ? setAsDefault : false,
  });
  // If setAsDefault is true, update other addresses to set isDefault to false.
  if (newAddress.isDefault) {
    await addressModel.updateOne(
      { userId, isDefault: true },
      { $set: { isDefault: false } }
    );
  }
  // Save the new address to the database and respond with the saved address.
  await newAddress.save();
  res.status(201).json({
    status: "success",
    message: "Address added successfully",
    data: newAddress,
  });
};

/**
 * @api { PUT } /address/update -update address
 */
export const updateAddress = async (req, res, next) => {
  const {
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    setAsDefault,
  } = req.body;

  const userId = req.authUser._id;
  const { addressId } = req.params;

  const address = await addressModel.findOne({
    _id: addressId,
    userId,
    isMarkedAsDeleted: false,
  });
  if (!address) {
    return next(new ErrorClass("Address not found", 404, "Address not found"));
  }
  if (country) {
    address.country = country;
  }
  if (city) {
    address.city = city;
  }
  if (postalCode) {
    address.postalCode = postalCode;
  }
  if (buildingNumber) {
    address.buildingNumber = buildingNumber;
  }
  if (floorNumber) {
    address.floorNumber = floorNumber;
  }
  if (addressLabel) {
    address.addressLabel = addressLabel;
  }
  if ([true, false].includes(setAsDefault)) {
    address.isDefault = [true, false].includes(setAsDefault)
      ? setAsDefault
      : false;
    await addressModel.updateOne(
      { userId, isDefault: true },
      { isDefault: false },
      { new: true }
    );
  }

  await address.save();

  res.status(200).json({
    status: "success",
    message: "Address updated successfully",
    data: address,
  });
};

/**
 * @api { GET } /address -get all addresses
 */
export const getAddresses = async (req, res, next) => {
  const userId = req.authUser._id;

  const address = await addressModel.find(
    {
      userId,
      isMarkedAsDeleted: false,
    });
  if (!address) {
    return next(new ErrorClass("Address not found", 404, "Address not found"));
  }
  res.status(200).json({
    status: "success",
    message: "Addresses fetched successfully",
    data: address,
  });
};

/**
 * @api { DELETE } /address/delete -delete address
 */
export const deleteAddress = async (req, res, next) => {
  const userId = req.authUser._id;
  const { addressId } = req.params;

  const address = await addressModel.findOneAndUpdate(
    {
      _id: addressId,
      userId,
      isMarkedAsDeleted: false,
    },
    {
      isMarkedAsDeleted: true,
      isDefault: false,
    },
    { new: true }
  );
  if (!address) {
    return next(new ErrorClass("Address not found", 404, "Address not found"));
  }

  res.status(200).json({
    status: "success",
    message: "Address deleted successfully",
  });
};
