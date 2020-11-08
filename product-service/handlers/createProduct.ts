import {APIGatewayProxyEvent, APIGatewayProxyHandler} from 'aws-lambda';
import {productsService} from '../shared/services/products';
import {RESPONSE} from '../shared/constants/responses';
import {Product} from '../shared/models/product';

export const createProduct = async (event: APIGatewayProxyEvent) => {
  try {
    console.log('CREATE Product: ', event);

    const {title, description, count, price} = JSON.parse(event.body) as Product;

    const product = await productsService.createProductInDB(title, description, +count, +price);

    console.log(product);

    if (!product) {
      return RESPONSE._404('Product not found');
    }

    return RESPONSE._200(product);
  } catch (err) {
    return RESPONSE._500('Internal Server Error');
  }
};

export const createProductHandler: APIGatewayProxyHandler = async event => {
  return createProduct(event);
};
