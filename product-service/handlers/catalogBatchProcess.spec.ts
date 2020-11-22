import createEvent from '@serverless/event-mocks';
import {catalogBatchProcess} from './catalogBatchProcess';
import {notifyService, productsService} from '../shared/services/products';

const MOCK_PRODUCTS = [
  {
    title: 'New Hublot 7',
    description: 'some description',
    imageUrl: 'https://source.unsplash.com/random',
    price: 257500,
    count: 3
  },
  {
    title: 'New Hublot 1',
    description: 'some description',
    price: 200500,
    count: 3
  }
];

const MOCK_PRODUCTS_INVALID = [
  {
    title: 'New Hublot 7',
    description: 'some description',
    imageUrl: 'https://source.unsplash.com/random',
    price: 'yyy',
    count: 'zzz'
  }
];

const MOCK_NOTIFICATION_MESSAGE = `test-uuid: New Hublot 7 (price: $257500, count: 3)
test-uuid: New Hublot 7 (price: $257500, count: 3)`;

describe('importProductsFile handler', () => {
  describe('products are valid', () => {
    it('should send email notification', async () => {
      const minPrice = Math.min.apply(
        null,
        MOCK_PRODUCTS.map(({price}) => price)
      );
      const spyEmail = spyOn(notifyService, 'sendEmail');
      spyOn(productsService, 'createProductInDB').and.returnValue({
        id: 'test-uuid',
        ...MOCK_PRODUCTS[0]
      });

      const mockEvent = createEvent('aws:sqs', {
        Records: MOCK_PRODUCTS.map(pr => {
          return {
            body: JSON.stringify(pr)
          };
        })
      } as any);

      await catalogBatchProcess(mockEvent);

      expect(spyEmail).toHaveBeenCalledWith(MOCK_NOTIFICATION_MESSAGE, minPrice);
    });
  });

  describe('products are not valid', () => {
    it('should not send email notification', async () => {
      const spyEmail = spyOn(notifyService, 'sendEmail').and.returnValue('');

      const mockEvent = createEvent('aws:sqs', {
        Records: MOCK_PRODUCTS_INVALID.map(pr => {
          return {
            body: JSON.stringify(pr)
          };
        })
      } as any);

      await catalogBatchProcess(mockEvent);

      expect(spyEmail).not.toHaveBeenCalled();
    });
  });
});
