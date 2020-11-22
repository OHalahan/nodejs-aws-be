import {productsService} from '../shared/services/products';
import {Product} from '../shared/models/product';
import {getProductsList} from './getProductsList';
import {RESPONSE} from '../../shared/constants/responses';
import createEvent from '@serverless/event-mocks';

const mockEvent = createEvent('aws:apiGateway', {
  pathParameters: {}
} as any);

describe('getProductsList handler', () => {
  it('should return all products', async () => {
    const products: Product[] = [
      {
        id: 'efaf5d0a-df8d-4acc-bfe7-0f8977c17eb0',
        description: 'test',
        title: 'test',
        imageUrl: 'test.com',
        price: 500000,
        count: 4
      }
    ];

    spyOn(productsService, 'getProductsFromDB').and.returnValue(products);

    expect(await getProductsList(mockEvent)).toMatchObject(RESPONSE._200(products));
  });

  it('should return 500 code in case of unknown fail', async () => {
    spyOn(productsService, 'getProductsFromDB').and.throwError('');

    expect(await getProductsList(mockEvent)).toMatchObject(RESPONSE._500('Internal Server Error'));
  });
});
