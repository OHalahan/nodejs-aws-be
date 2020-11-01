import createEvent from '@serverless/event-mocks';
import { productsService } from '../shared/services/products';
import { Product } from '../shared/models/product';
import { getProductById } from './getProductById';
import { HEADERS } from '../shared/constants/headers';

describe('getProductById handler', () => {
  describe('id is present', () => {
    it('should return product', async () => {
      const mockEvent = createEvent('aws:apiGateway', {
        pathParameters: {
          id: '1',
        },
      } as any);

      const product: Product = {
        id: 1,
        description: 'test',
        title: 'test',
        imageUrl: 'test.com',
        price: 77000
      };

      spyOn(productsService, 'getProductByIdFromDB').and.returnValue(product);

      const result = await getProductById(mockEvent);

      expect(result).toMatchObject({
        body: JSON.stringify(product),
        headers: HEADERS,
        statusCode: 200
      });
    });
  });

  describe('id is missing', () => {
    it('should return meaningful message', async () => {
      const mockEvent = createEvent('aws:apiGateway', {
        pathParameters: {},
      } as any);

      expect(await getProductById(mockEvent)).toMatchObject({body: "No ID provided", statusCode: 400});
    });
  });
});
