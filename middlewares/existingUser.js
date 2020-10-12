import _ from "lodash";
import query from '@database/index'
import { statusCodes, messages } from "@common/helpers";


async function existingUser(req, res, next) {
  var body = _.pick(req.body, "email");
  try {
    const sqlSelectQuery = `SELECT * FROM customers user WHERE email = ? `;
    const details = await query(sqlSelectQuery, [body.email]);
    if (details.length) {
      return res.json({
        status: {
          code: statusCodes.bad_request,
          message: messages.duplicateDetails,
        },
      });
    } else {
      next();
    }
  } catch (error) {
    throw {
      status: {
        code: statusCodes.internal_server_error,
        message: messages.internalServerError,
      },
    };
  }
}

export default existingUser;
