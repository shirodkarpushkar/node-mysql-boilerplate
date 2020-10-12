import { statusCodes, messages } from "@common/helpers";
import query from "@database/index";
import _ from "lodash";

/**
 * API for getting products
 * @param {*} req (registration details)
 * @param {*} res (json with success/failure)
 */
async function getAllProducts(req, res) {
  try {
    const sqlQuery = "call getAllProducts()";
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
 * API for getting products
 * @param {*} req (registration details)
 * @param {*} res (json with success/failure)
 */
async function getProductById(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);
    const sqlQuery = "call getProductById(?)";
    const getDetails = await query(sqlQuery, [productId]);
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
 * API for getting reviews by productId
 * @param {*} req (productId)
 * @param {*} res (json with success/failure)
 */
async function getReviewsByProductId(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);
    const sqlQuery = `SELECT reviews.id,
    title,
    body,
    rating,
    product,
    review_date,
    customers.id as "customer_id",
    customers.first_name as "customer_first_name",
    customers.last_name as "customer_last_name",
    images.destination as "customer_avatar"
FROM reviews
LEFT JOIN customers ON ( reviews.customer = customers.id )
LEFT JOIN images ON ( customers.avatar = images.id )
where product = ?`;
    const getDetails = await query(sqlQuery, [productId]);
    let response = getDetails.map((el) => {
      return {
        id: el.id,
        title: el.title,
        body: el.body,
        rating: el.rating,
        product: el.product,
        customer: {
          id: el.customer_id,
          name: el.customer_first_name + " " + el.customer_last_name,
          avatar : el.customer_avatar
        },
        createdAt: el.review_date,
      };
    })
    return res.json({
      status: {
        code: statusCodes.success,
        message: messages.success,
      },
      result: response,
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
  getAllProducts,
  getProductById,
  getReviewsByProductId,
};
