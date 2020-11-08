import {Product} from '../../models/product';
import {Client} from 'pg';
import {DB_CONFIG} from '../../constants/config';

export async function getProductByIdFromDB(id: string): Promise<Product> {
  const client = new Client(DB_CONFIG);

  await client.connect();

  try {
    const result = await client.query(
        `SELECT p.id, p.title, p.description, p.image_url, p.price, s.count
         FROM products p
                  LEFT JOIN stocks s on p.id = s.product_id
         WHERE p.id = $1`,
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
        `SELECT p.id, p.title, p.description, p.image_url, p.price, s.count
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

export async function createProductInDB(title: string, description: string, price: number, count: number): Promise<Product> {
  const client = new Client(DB_CONFIG);

  const imageUrl = 'https://source.unsplash.com/random';

  await client.connect();

  try {
    await client.query('BEGIN');

    const insertQuery = 'INSERT INTO products(title, description, image_url, price) VALUES ($1, $2, $3, $4)';
    return await client.query(insertQuery, [title, description, imageUrl, price]) as unknown as Product;
  } catch (e) {
    console.log(`Failed to CREATE Product in DB : `, e);
    throw e;
  } finally {
    await client.end();
  }
}

