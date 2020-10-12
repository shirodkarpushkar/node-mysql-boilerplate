import express from 'express'
import customers from '@modules/customers/routes'
import images from "@modules/images/routes";
import products from "@modules/products/routes";
import categories from "@modules/categories/routes";

var app = express()
app.use("/customers", customers);
app.use("/images", images);
app.use("/products", products);
app.use("/categories", categories);

module.exports = app
