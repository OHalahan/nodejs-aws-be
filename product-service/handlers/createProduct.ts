import {APIGatewayProxyEvent, APIGatewayProxyHandler} from 'aws-lambda';
import {productsService} from '../shared/services/products';
import {RESPONSE} from '../shared/constants/responses';
import {Product} from '../shared/models/product';

export const createProduct = async (event: APIGatewayProxyEvent) => {
  try {
    console.log('CREATE Product: ', event);

    const {title, description, price, count} = JSON.parse(event.body) as Product;
    const imageUrl = 'https://source.unsplash.com/random'; // hardcoded for now

    if (typeof title !== 'string' || !title.length) {
      return RESPONSE._400('Title is invalid');
    }

    if (typeof description !== 'string' || !description.length) {
      return RESPONSE._400('Description is invalid');
    }

    if (!price || isNaN(+price)) {
      return RESPONSE._400('Price is invalid');
    }

    if (!count || isNaN(+count)) {
      return RESPONSE._400('Count is invalid');
    }

    const product = await productsService.createProductInDB(title, description, +price, imageUrl, +count);

    if (!product) {
      return RESPONSE._500('Failed to create product');
    }

    return RESPONSE._200(product);
  } catch (err) {
    return RESPONSE._500('Internal Server Error');
  }
};

export const createProductHandler: APIGatewayProxyHandler = async event => {
  return createProduct(event);
};
