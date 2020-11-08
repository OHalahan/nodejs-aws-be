import {Product} from '../../models/product';
import {Client} from 'pg';
import {DB_CONFIG} from '../../constants/config';

const productByIdQuery = `SELECT p.id, p.title, p.description, p.image_url as "imageUrl", p.price, s.count
                          FROM products p
                                   LEFT JOIN stocks s on p.id = s.product_id
                          WHERE p.id = $1`;

export async function getProductByIdFromDB(id: string): Promise<Product> {
  const client = new Client(DB_CONFIG);

  await client.connect();

  try {
    const result = await client.query(
      productByIdQuery,
      [id]
    );

    const [product] = result.rows;
    return product;
  } catch (e) {
    console.log(`Failed to GET Product ${id} from DB : `, e);
    throw e;
  } finally {
    await client.end();
  }
}

export async function getProductsFromDB(): Promise<Product[]> {
  const client = new Client(DB_CONFIG);

  await client.connect();

  try {
    const result = await client.query(
        `SELECT p.id, p.title, p.description, p.image_url as "imageUrl", p.price, s.count
         FROM products p
                  LEFT JOIN stocks s on p.id = s.product_id`
    );

    return result.rows;
  } catch (e) {
    console.log('Failed to GET Products from DB: ', e);
    throw e;
  } finally {
    await client.end();
  }
}

export async function createProductInDB(title: string, description: string, price: number, imageUrl: string, count: number): Promise<Product> {
  const client = new Client(DB_CONFIG);

  await client.connect();

  try {
    await client.query('BEGIN');

    const insertProductQuery = 'INSERT INTO products(title, description, image_url, price) VALUES ($1, $2, $3, $4) RETURNING id';
    const insertProductResult = await client.query(insertProductQuery, [title, description, imageUrl, price]);
    const productId = insertProductResult?.rows[0]?.id;

    const insertStockQuery = 'INSERT INTO stocks(product_id, count) VALUES ($1, $2)';
    await client.query(insertStockQuery, [productId, count]);

    const result = await client.query(productByIdQuery, [productId]);
    const [product] = result.rows;

    if (!product) {
      throw 'Transaction Failed';
    }

    await client.query('COMMIT');

    return product;
  } catch (e) {
    console.log(`Failed to CREATE Product in DB : `, e);
    await client.query('ROLLBACK');

    throw e;
  } finally {
    await client.end();
  }
}

