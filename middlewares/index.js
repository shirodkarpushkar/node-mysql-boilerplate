import imageUploadMiddleware from "@middlewares/imageMiddleware";
import existingUser from "@middlewares/existingUser";
import auth  from "@middlewares/auth";

module.exports = {
  imageUploadMiddleware,
  existingUser,
  auth,
};
