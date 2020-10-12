import query from "@database/index";
import { functions, statusCodes, messages } from "@common/helpers";
import { response } from "express";

async function uploadImage(req, res) {
  try {
    if (req.file) {
      let file = req.file;
      const insertQuery =
        "INSERT INTO images (filename, destination, mimetype, size) VALUES (?, ?, ?,?)";
      const insertResponse = await query(insertQuery, [
        file.filename,
        file.destination.split("/")[1] + "/" + file.filename,
        file.mimetype,
        file.size,
      ]);

      let id = insertResponse.insertId;
      const getQuery = "SELECT * FROM images WHERE id = ?";
      const getReponse = await query(getQuery, [id]);
      res.json({
        status: {
          code: statusCodes.success,
          message: messages.success,
        },
        result: getReponse ? getReponse[0] : null,
      });
    }
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

module.exports = {
  uploadImage,
};
