import {APIGatewayProxyEvent, APIGatewayProxyHandler} from 'aws-lambda';
import {productsService} from '../shared/services/products';
import {RESPONSE} from '../shared/constants/responses';

export const getProductById = async (event: APIGatewayProxyEvent) => {
  try {
    console.log('GET Product By ID: ', event);

    const {id} = event.pathParameters || {};

    if (id === null || id === undefined || id === '') {
      return RESPONSE._400('No ID provided');
    }

    const product = await productsService.getProductByIdFromDB(String(id));

    if (!product) {
      return RESPONSE._404('Product not found');
    }

    return RESPONSE._200(product);
  } catch (err) {
    return RESPONSE._500('Internal Server Error');
  }
};

export const getProductByIdHandler: APIGatewayProxyHandler = async event => {
  return getProductById(event);
};
