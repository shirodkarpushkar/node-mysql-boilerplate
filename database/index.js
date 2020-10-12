import db from "@database/dbConnect";
import util from "util";

const query = util.promisify(db.query).bind(db);

export default query