import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { userModel } from "../../../DB/Models/user.model.js";
import { sendEmail } from "../../Services/sendEmail.service.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { nanoid } from "nanoid";

/**
 * @api { POST} /user/add - Add a new user
 */
export const signUp = async (req, res, next) => {
  const { username, email, password, age, phoneNumbers, gender, userType } =
    req.body;

  const isEmailExist = await userModel.findOne({ email });
  if (isEmailExist) {
    return next(
      new ErrorClass("Email already exists", 400, "Email already exists")
    );
  }

  // generate token for confirmation
  const token = jwt.sign({ email }, process.env.CONFIRM_SECRET, {
    expiresIn: 60,
  });
  const link = `${req.protocol}://${req.headers.host}/user/confirmEmail/${token}`;

  const rfToken = jwt.sign({ email }, process.env.RE_CONFIRM_SECRET);
  const rfLink = `${req.protocol}://${req.headers.host}/user/refreshConfirmation/${rfToken}`;
  // send email with confirmation link
  const isEmailSent = await sendEmail(
    email,
    "Verify your email",
    `<a href = '${link}' >confirm</a> <br>
    <a href = '${rfLink}' >click her to resend confirmation link </a>`
  );

  // check if email not sent
  if (!isEmailSent) {
    return next(new ErrorClass("failed to send email", 400));
  }

  const userData = new userModel({
    username,
    email,
    password,
    age,
    phoneNumbers,
    gender,
    userType,
  });

  const newUser = await userData.save();
  return res
    .status(201)
    .json({ msg: "User added successfully", data: newUser });
};

/**
 * @api { get } /user/confirmedEmail  -send confirmation to user Email
 */

export const isEmailConfirmed = async (req, res, next) => {
  const { token } = req.params;

  //decode token to get email address
  const decodeToken = jwt.verify(token, process.env.CONFIRM_SECRET);

  // check if token not decoded successfully
  if (!decodeToken) {
    return next(new ErrorClass("Invalid token", 400));
  }

  // update confirmed if token decoded successfully
  const user = await userModel.findOneAndUpdate(
    { email: decodeToken.email },
    { isEmailVerified: true },
    { new: true }
  );

  //check if user not found
  if (!user) {
    return next(new ErrorClass("User not found", 404));
  }
  return res.status(200).json({ msg: "Email confirmed successfully" });
};

/**
 * @api { get } /user/refreshConfirmation  -refresh the confirmation link
 */
export const refreshToken = async (req, res, next) => {
  const { rfToken } = req.params;

  //decode token to get email address
  const decodeToken = jwt.verify(rfToken, process.env.RE_CONFIRM_SECRET);

  // check if token not decoded successfully
  if (!decodeToken) {
    return next(new ErrorClass("Invalid token", 400));
  }
  const confirmedUser = await userModel.findOne({
    email: decodeToken.email,
    isEmailVerified: true,
  });
  if (confirmedUser) {
    return next(new ErrorClass("user is already confirmed", 400));
  }
  // generate token for confirmation
  const token = jwt.sign(
    { email: decodeToken.email },
    process.env.CONFIRM_SECRET,
    {
      expiresIn: 60,
    }
  );
  const link = `${req.protocol}://${req.headers.host}/user/confirmEmail/${token}`;
  // send email with confirmation link
  await sendEmail(
    decodeToken.email,
    "Verify your email",
    `<a href = '${link}' >confirm</a>`
  );

  return res.status(200).json({ msg: "Email confirmed successfully" });
};

/**
 * @api { POST } /user/login   -login Access
 */
export const Login = async (req, res, next) => {
  const { email, password, phoneNumbers } = req.body;

  // find user
  const user = await userModel.findOne({
    $or: [{ email }, { phoneNumbers }],
    isEmailVerified: true,
  });

  // check if user not found or not confirmed or password incorrect
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return next(
      new ErrorClass(
        "Invalid credentials",
        400,
        "Email invalid or not confirmed or password incorrect or user not found"
      )
    );
  }

  // generate and return token  for user
  const token = jwt.sign({ id: user._id, email }, process.env.LOGIN_SECRET);
  return res.status(200).json({ msg: "Login success", token });
};

/**
 * @api { PUT } /user/update -update User
 */

export const updateAccount = async (req, res, next) => {
  const { username, email, age, phoneNumbers } = req.body;
  // Ensure only the owner of the account can update their data
  const userId = req.authUser._id;

  const user = await userModel.findById(userId);

  //check if user not found
  if (!user) {
    return next(new ErrorClass("User not found", 404));
  }

  if (username) {
    user.username = username;
  }
  if (email) {
    const existingEmailUser = await userModel.findOne({ email });
    if (existingEmailUser) {
      return next(new ErrorClass("Email is already exist", 409));
    }
    // generate token for confirmation
    const token = jwt.sign({ email }, process.env.CONFIRM_SECRET);
    const link = `${req.protocol}://${req.headers.host}/user/confirmEmail/${token}`;

    // send email with confirmation link
    const isEmailSent = await sendEmail(
      email,
      "welcome to job searching app",
      `<a href = '${link}' >confirm email</a>`
    );

    // check if email not sent
    if (!isEmailSent) {
      return next(new ErrorClass("failed to send email", 400));
    }
    user.email = email;
  }
  if (age) {
    user.age = age;
  }
  if (phoneNumbers) {
    user.phoneNumbers = phoneNumbers;
  }

  const updatedUser = await user.save();
  return res
    .status(200)
    .json({ msg: "User updated successfully", data: updatedUser });
};

/**
 * @api { patch } /user/sendCode -forgetPassword Aand sen code
 */
export const forgetPassword = async (req, res, next) => {
  const userId = req.authUser._id;
  const user = await userModel.findById(userId);
  if (!user) {
    return next(new ErrorClass("user is not found", 400));
  }

  const code = nanoid(6);

  await sendEmail(
    user.email,
    "Forget Password Code",
    `<h1>your code is ${code}</h1>`
  );

  user.code = code;
  await user.save();
  return res.status(200).json({ msg: "Password OTP code sent" });
};

/**
 * @api { patch } /user/resetPassword -reset p  assword
 */
export const resetPassword = async (req, res, next) => {
  const { code, password, CPassword } = req.body;

  const userId = req.authUser._id;

  const user = await userModel.findById(userId);
  if (!user) {
    return next(new ErrorClass("user is not found", 400));
  }
  if (code !== user.code) {
    return next(new ErrorClass("Invalid code", 400));
  }

  // Check if passwords match
  if (password !== CPassword) {
    return next(new ErrorClass("Passwords do not match", 400));
  }

  user.password = password;

  await user.save();

  return res.status(200).json({ msg: "Password reset successfully" });
};

export const getProfile = async (req, res, next) => {
  const userId = req.authUser._id;
  const user = await userModel.findById(userId);
  if (!user) {
    return next(new ErrorClass("User not found", 404));
  }
  return res.status(200).json({
    msg: "User profile",
    data: {
      username: user.username,
      email: user.email,
      age: user.age,
      phoneNumbers: user.phoneNumbers,
      gender: user.gender,
    },
  });
};

export const deleteAccount = async (req, res, next) => {
  const userId = req.authUser._id;

  const user = await userModel.findById(userId);

  if (!user) {
    return next(new ErrorClass("User not found", 404));
  }

  if (user.isDeletedAsMarked) {
    return next(new ErrorClass("User account is already deleted", 400));
  }

  user.isDeletedAsMarked = true;
  await user.save();

  res.status(200).json({ message: "Account has been deleted successfully." });
};
