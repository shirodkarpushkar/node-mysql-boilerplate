
import {  statusCodes, messages } from "@common/helpers";
import query from "@database/index";
import _ from "lodash";



/**
 * API for getting categories
 * @param {*} req ( none )
 * @param {*} res (json with success/failure)
 */
async function getAllCategories(req, res) {
  try {
    const sqlQuery = "call getAllCategories()";
    const getDetails = await query(sqlQuery);
    return res.json({
      status: {
        code: statusCodes.success,
        message: messages.success,
      },
      result: getDetails[0],
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
 * API for getting category by id
 * @param {*} req (param categoryId)
 * @param {*} res (json with success/failure)
 */
async function getCategoryById(req, res) {
  try {
    const categoryId = parseInt(req.params.id,10);
    const sqlQuery = "call getCategoryById(?)";
    const getDetails = await query(sqlQuery, [categoryId]);
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

module.exports = {
  getAllCategories,
  getCategoryById,
};