import { functions, statusCodes, messages } from "@common/helpers";
import query from "@database/index";
import config from "@config";
import fs from "fs";
import validator from "validator";
import _ from "lodash";

/**
 * API for email verification
 * @param {*} req (registration details)
 * @param {*} res (json with success/failure)
 */
async function registration(req, res) {
  var body = _.pick(req.body, [
    "firstName",
    "lastName",
    "email",
    "password",
    "avatar",
    "addressLine1",
    "addressLine2",
    "city",
    "state",
    "zipcode",
  ]);
  body.password = functions.encryptData(body.password);
  const insertCustomer =
    "INSERT INTO customers (first_name,last_name,email,password,avatar) VALUES (?,?,?,?,?)";
  const insertCustomerAddress =
    "INSERT INTO customer_addresses (customer, address, address2, city, state, zipcode ) VALUES (?, ?, ?, ?, ?, ? )";
  try {
    const insertCustomerResponse = await query(insertCustomer, [
      body.firstName,
      body.lastName,
      body.email,
      body.password,
      body.avatar,
    ]);

    let customerId = insertCustomerResponse.insertId;
    const insertCustomerAddressResponse = await query(insertCustomerAddress, [
      customerId,
      body.addressLine1,
      body.addressLine2,
      body.city,
      body.state,
      body.zipcode,
    ]);
    let token = await functions.tokenEncrypt(body.email);
    token = Buffer.from(token, "ascii").toString("hex");
    let emailMessage = fs
      .readFileSync("common/EmailTemplate/welcome.html", "utf8")
      .toString();
    emailMessage = emailMessage
      .replace("$fullname", body.firstName)
      .replace("$link", config.emailVerificationLink + token);
    functions.sendEmail(body.email, "Welcome to Smart Store", emailMessage);

    return res.json({
      status: {
        code: statusCodes.success,
        message: messages.registration,
      },
    });
  } catch (err) {
    if (err) {
      return res.json({
        status: {
          code: statusCodes.bad_request,
          message: messages.badRequest,
        },
      });
    }
  }
}

/**
 * API for email verification
 * @param {*} req (email)
 * @param {*} res (json with success/failure)
 */
async function verifyEmail(req, res) {
  var body = _.pick(req.body, ["token"]);
  try {
    const token = Buffer.from(body.token, "hex").toString("ascii");
    const tokenDecrypt = functions.tokenDecrypt(token);

    const updateQuery =
      "UPDATE customers SET is_email_verified = 1 WHERE email = ?";
    const verifyEmailDetails = await query(updateQuery, [tokenDecrypt.data]);
    return res.json({
      status: {
        code: statusCodes.success,
        message: messages.emailVerificationSuccess,
      },
      result: verifyEmailDetails,
    });
  } catch (error) {
    return res.json({
      status: {
        code: error.statusCode,
        message: error.message,
      },
      result: JSON.stringify(error),
    });
  }
}

/**
 * API for signin
 * @param {*} req (email and password)
 * @param {*} res (json with success/failure)
 */
async function signIn(req, res) {
  var body = _.pick(req.body, ["email", "password"]);
  try {
    if (!validator.isEmail(body.email)) {
      throw {
        statusCode: statusCodes.bad_request,
        message: messages.invalidLoginDetails,
        result: null,
      };
    }
    const getQuery =
      "SELECT customers.id, first_name, last_name, email,images.destination as avatar, password, is_email_verified FROM customers LEFT JOIN  images ON ( customers.avatar = images.id) WHERE email = ?";
    const loginDetails = await query(getQuery, [body.email]);
    if (loginDetails.length <= 0) {
      throw {
        statusCode: statusCodes.bad_request,
        message: messages.invalidLoginDetails,
        result: null,
      };
    }
    const password = functions.decryptData(loginDetails[0].password);
    if (password !== body.password) {
      throw {
        statusCode: statusCodes.bad_request,
        message: messages.invalidLoginDetails,
        result: null,
      };
    }
    if (loginDetails[0].is_email_verified == 0) {
      throw {
        statusCode: statusCodes.bad_request,
        message: messages.emailVerify,
        result: null,
      };
    }
    const userDetails = {
      firstName: loginDetails[0].first_name,
      lastName: loginDetails[0].last_name,
      email: loginDetails[0].email,
      avatar: loginDetails[0].avatar,
    };
    const token = await functions.tokenEncrypt(userDetails);
    userDetails.token = token;
    return res.json({
      status: {
        code: statusCodes.success,
        message: messages.success,
      },
      result: userDetails,
    });
  } catch (error) {
    return res.json({
      status: {
        code: error.statusCode,
        message: error.message,
      },
      result: JSON.stringify(error),
    });
  }
}

/**
 * API to Change password
 * @param {*} req (old password, token, new password )
 * @param {*} res (json with success/failure)
 */
async function changePassword(req, res) {
  try {
    var body = _.pick(req.body, ["oldPassword", "newPassword"]);
    const email = res.locals.tokenInfo.email;
    if (
      validator.isEmpty(body.oldPassword) &&
      validator.isEmpty(body.newPassword)
    ) {
      throw {
        statusCode: statusCodes.bad_request,
        message: messages.badRequest,
        result: null,
      };
    }
    const getQuery = `SELECT password FROM customers WHERE email = ?`;
    const getPassword = await query(getQuery, [email]);
    if (getPassword.length <= 0) {
      throw {
        statusCode: statusCodes.bad_request,
        message: messages.invalidDetails,
        result: null,
      };
    }
    let password = functions.decryptData(getPassword[0].password);
    if (password !== body.oldPassword) {
      throw {
        statusCode: statusCodes.bad_request,
        message: messages.invalidPassword,
        result: null,
      };
    }
    // Encrypt password for the user
    password = functions.encryptData(body.newPassword);
    const updateQuery = "UPDATE customers SET password = ? WHERE email = ?";
    const updatePassword = await query(updateQuery, [password, email]);
    return res.json({
      status: {
        code: statusCodes.success,
        message: messages.passwordChanged,
      },
      result: updatePassword,
    });
  } catch (error) {
    return res.json({
      status: {
        code: error.statusCode,
        message: error.message,
      },
      result: JSON.stringify(error),
    });
  }
}
/**
 * API for Forgot Password
 * @param {*} req (email address )
 * @param {*} res (json with success/failure)
 */
async function forgotPassword(req, res) {
  try {
    var body = _.pick(req.body, ["email"]);

    if (!validator.isEmail(body.email)) {
      throw {
        statusCode: statusCodes.bad_request,
        message: messages.invalidEmail,
        result: null,
      };
    }
    const getQuery =
      "SELECT id, first_name, last_name, email from customers where email = ?";

    const userDetail = await query(getQuery, [body.email]);

    if (userDetail.length <= 0) {
      throw {
        statusCode: statusCodes.bad_request,
        message: messages.emailAbsent,
        data: null,
      };
    }
    const to = userDetail[0].email;
    let token = await functions.tokenEncrypt(to);
    token = Buffer.from(token, "ascii").toString("hex");
    const subject = messages.forgotPasswordSubject;
    const link = config.resetPasswordLink + token;
    let emailMessage = fs
      .readFileSync("common/emailtemplate/reset.html", "utf8")
      .toString();
    emailMessage = emailMessage
      .replace("$fullname", userDetail[0].first_name)
      .replace("$link", link)
      .replace("$emailId", config.supportEmail);

    functions.sendEmail(to, subject, emailMessage);

    return res.json({
      status: {
        code: statusCodes.success,
        message: messages.resetLink,
      },
    });
  } catch (error) {
    return res.json({
      status: {
        code: error.statusCode,
        message: error.message,
      },
      result: JSON.stringify(error),
    });
  }
}
/**
 * API for Reset Password
 * @param {*} req (emailAddress )
 * @param {*} res (json with success/failure)
 */
async function resetPassword(req, res) {
  try {
    var body = _.pick(req.body, ["token", "newPassword"]);

    if (validator.isEmpty(body.token) || validator.isEmpty(body.newPassword)) {
      throw {
        statusCode: statusCodes.bad_request,
        message: messages.invalidDetails,
        result: null,
      };
    }
    const email = Buffer.from(body.token, "hex").toString("ascii");
    const emailAddressDetails = await functions.tokenDecrypt(email);
    if (!emailAddressDetails.data) {
      throw {
        statusCode: statusCodes.unauthorized,
        message: messages.emailLinkExpired,
        result: null,
      };
    }
    const password = functions.encryptData(body.newPassword);
    const updateQuery = "UPDATE customers SET password = ? WHERE email = ?";

    const passwordDetails = await query(updateQuery, [
      password,
      emailAddressDetails.data,
    ]);

    return res.json({
      status: {
        code: statusCodes.success,
        message: messages.passwordReset,
      },
    });
  } catch (error) {
    return res.json({
      status: {
        code: error.statusCode,
        message: error.message,
      },
      result: JSON.stringify(error),
    });
  }
}
/**
 * API for getting user profile
 * @param {*} req (email )
 * @param {*} res (json with success/failure)
 */
async function getProfile(req, res) {
  try {
    const email = res.locals.tokenInfo.email;
    const getQuery = "call getProfile(?)";
    const getDetails = await query(getQuery, [email]);
    return res.json({
      status: {
        code: statusCodes.success,
        message: messages.success,
      },
      result: getDetails[0][0],
    });
  } catch (error) {
    return res.json({
      status: {
        code: error.statusCode,
        message: error.message,
      },
      result: JSON.stringify(error),
    });
  }
}
/**
 * API for updating user profile
 * @param {*} req ("firstName",
      "lastName",
      "avatar",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "zipcode" )
 * @param {*} res (json with success/failure)
 */
async function updateProfile(req, res) {
  try {
    var body = _.pick(req.body, [
      "firstName",
      "lastName",
      "avatar",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "zipcode",
    ]);
    const email = res.locals.tokenInfo.email;
    const sqlQuery = "call updateProfile(?,?,?,?,?,?,?,?,?)";
    const getDetails = await query(sqlQuery, [
      email,
      body.firstName,
      body.lastName,
      body.avatar,
      body.addressLine1,
      body.addressLine2,
      body.city,
      body.state,
      body.zipcode,
    ]);
    return res.json({
      status: {
        code: statusCodes.success,
        message: messages.success,
      },
      result: getDetails,
    });
  } catch (error) {
    return res.json({
      status: {
        code: error.statusCode,
        message: error.message,
      },
      result: JSON.stringify(error),
    });
  }
}
module.exports = {
  registration,
  verifyEmail,
  changePassword,
  signIn,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};
