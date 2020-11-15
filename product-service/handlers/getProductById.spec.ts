import createEvent from '@serverless/event-mocks';
import { productsService } from '../shared/services/products';
import { Product } from '../shared/models/product';
import { getProductById } from './getProductById';
import {RESPONSE} from '../../shared/constants/responses';

describe('getProductById handler', () => {
  describe('id is present', () => {
    it('should return product', async () => {
      const mockEvent = createEvent('aws:apiGateway', {
        pathParameters: {
          id: 'efaf5d0a-df8d-4acc-bfe7-0f8977c17eb0',
        },
      } as any);

      const product: Product = {
        id: 'efaf5d0a-df8d-4acc-bfe7-0f8977c17eb0',
        description: 'test',
        title: 'test',
        imageUrl: 'test.com',
        price: 77000,
        count: 2,
      };

      spyOn(productsService, 'getProductByIdFromDB').and.returnValue(product);

      const result = await getProductById(mockEvent);

      expect(result).toMatchObject(RESPONSE._200(product));
    });
  });

  describe('id is missing', () => {
    it('should return meaningful message', async () => {
      const mockEvent = createEvent('aws:apiGateway', {
        pathParameters: {},
      } as any);

      expect(await getProductById(mockEvent)).toMatchObject(RESPONSE._400('No ID provided'));
    });
  });
});
