import {APIGatewayProxyEvent, APIGatewayProxyHandler} from 'aws-lambda';
import {productsService} from '../shared/services/products';
import {RESPONSE} from '../shared/constants/responses';

export const getProductsList = async (event: APIGatewayProxyEvent) => {
  try {
    console.log('GET Products: ', event);

    const ProductsList = await productsService.getProductsFromDB();

    if (!ProductsList || !ProductsList.length) {
      return RESPONSE._404('Products not found');
    } else {
      return RESPONSE._200(ProductsList);
    }
  } catch (err) {
    return RESPONSE._500('Internal Server Error');
  }
};

export const getProductsListHandler: APIGatewayProxyHandler = async event => {
  return getProductsList(event);
};
