import { productsService } from '../shared/services/products';
import { Product } from '../shared/models/product';
import { getProductsList } from './getProductsList';
import {RESPONSE} from '../shared/constants/responses';

describe('getProductsList handler', () => {
  it('should return all products', async () => {
    const products: Product[] = [
      {
        id: 1,
        description: 'test',
        title: 'test',
        imageUrl: 'test.com',
        price: 500000,
        count: 4,
      },
    ];

    spyOn(productsService, 'getProductsFromDB').and.returnValue(products);

    expect(await getProductsList()).toMatchObject(RESPONSE._200(products));
  });

  it('should return 500 code in case of unknown fail', async () => {
    spyOn(productsService, 'getProductsFromDB').and.throwError('');

    expect(await getProductsList()).toMatchObject(RESPONSE._500('Internal Server Error'));
  });
});
