import { functions, statusCodes, messages } from "@common/helpers";

async function validateToken(req, res, next) {
  try {
    if (req.headers.auth) {
      const tokenDecryptInfo = await functions.tokenDecrypt(req.headers.auth);

      if (tokenDecryptInfo.data) {
        res.locals.tokenInfo = tokenDecryptInfo.data;
        const token = await functions.tokenEncrypt(tokenDecryptInfo.data);
        res.header("auth", token);
        next();
      } else {
        throw {
          statusCode: statusCodes.unauthorized,
          message: messages.sessionExpire,
          data: null,
        };
      }
    } else {
      throw {
        statusCode: statusCodes.bad_request,
        message: messages.tokenMissing,
        data: null,
      };
    }
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

module.exports = { validateToken };
