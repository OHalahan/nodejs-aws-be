import { productsService } from "../shared/services/products";
import { Product } from "../shared/models/product";
import { getProductsList } from "./getProductsList";
import { HEADERS } from "../shared/constants/headers";

describe('getProductsList handler', () => {
    it('should return all products', async () => {
      const products: Product[] = [
        {
          id: 1,
          description: 'test',
          title: 'test',
          imageUrl: 'test.com',
          price: 500000,
        },
      ];

      spyOn(productsService, 'getProductsFromDB').and.returnValue(products);
  
      expect(await getProductsList()).toMatchObject({
            body: JSON.stringify(products),
            headers: HEADERS,
            statusCode: 200
      });
    });
  
    it('should return 500 code in case of unknown fail', async () => {
        spyOn(productsService, 'getProductsFromDB').and.throwError('');
  
    expect(await getProductsList()).toMatchObject({body: "Internal Server Error", statusCode: 500});
    });
  });
  