import multer from "multer";
import { statusCodes } from "@common/helpers";
import path from 'path'
/* image middleware */
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    req.fileValidationError = "Only image files are allowed!";
    return cb(new Error("Only image files are allowed!"), false);
  }
};
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, `img-${Date.now()}${path.extname(file.originalname)}`);
  },
});
var upload = multer({
  storage,
  fileFilter: imageFilter,
}).single("image");

async function imageUploadMiddleware(req, res, next) {
  upload(req, res, (err) => {
    // req.file contains information of uploaded file
    // req.body contains information of text fields, if there were any

    if (req.fileValidationError) {
      return res.json({
        status: statusCodes.bad_request,
        message: "Only image files are allowed!",
      });
    } else if (!req.file) {
      return res.json({
        status: statusCodes.bad_request,
        message: "Please select an image to upload",
      });
    } else if (err instanceof multer.MulterError) {
      return res.json({
        status: statusCodes.bad_request,
        message: "Mulitple files are not allowed",
      });
    } else if (err) {
      return res.json({
        status: statusCodes.bad_request,
        message: "Please select an image to upload",
      });
    }
    next();
  });
}


export default imageUploadMiddleware
