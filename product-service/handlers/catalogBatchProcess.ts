import {SQSEvent, SQSHandler} from 'aws-lambda';

import {notifyService, productsService} from '../shared/services/products';

export const catalogBatchProcess = async (event: SQSEvent) => {
  try {
    const imageUrl = 'https://source.unsplash.com/random'; // hardcoded for now

    const products = event.Records.map(({body}) => JSON.parse(body));

    console.log('NEW PRODUCTS ARRIVED: ', event.Records);

    // Create an array of DB creation promises
    const asyncProductCreation = products
      // Filter out incorrect products
      .filter(pr => {
        const {title, description, price, count} = pr;
        if (typeof title !== 'string' || !title.length) {
          console.log('Title is invalid: ', pr);

          return false;
        }

        if (typeof description !== 'string' || !description.length) {
          console.log('Description is invalid: ', pr);

          return false;
        }

        if (!price || isNaN(+price)) {
          console.log('Price is invalid: ', pr);

          return false;
        }

        if (!count || isNaN(+count)) {
          console.log('Count is invalid: ', pr);

          return false;
        }

        return true;
      })
      .map(({title, description, price, count}) => {
        return productsService.createProductInDB(title, description, +price, imageUrl, +count);
      });

    // Expected an array of created products
    const createdProducts = await Promise.all(asyncProductCreation);

    if (!createdProducts || !createdProducts.length) {
      console.log('FAILED TO CREATE PRODUCTS: ', products);
    } else {
      console.log('CREATED PRODUCTS: ', createdProducts);

      const message = createdProducts.map((product) => {
        return `${product.id}: ${product.title} (price: ${product.price}$, count: ${product.count})`;
      }).join('\n');

      await notifyService.sendEmail(message);
    }
  } catch (err) {
    console.log('ERR: ', err);
  }
};

export const catalogBatchProcessHandler: SQSHandler = async event => {
  return catalogBatchProcess(event);
};
