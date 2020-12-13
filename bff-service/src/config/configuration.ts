import { ConfigModel } from '../models/config.model';

export const configuration = (): ConfigModel => ({
  api: process.env.CART_URL,
  products: process.env.PRODUCTS_URL,
});
