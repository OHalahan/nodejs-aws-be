import { APIGatewayProxyHandler } from "aws-lambda";
import { ResponseError } from "shared/classes/response-error";

import { Products } from '../data/products';
import { Product } from "../shared/models/product";

export const getProductById: APIGatewayProxyHandler = async (event) => {

    try {

        const { id } = event.pathParameters || {};

        if (id === null || id === undefined || id === '') {
            throw new ResponseError({
                message: 'No ID provided',
                code: 400
            });
        }

        const product = await getProductByIdFromDB(id);

        if (!product) {
            throw new ResponseError({
                message: 'Product not found',
                code: 404
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify(product)
        };

    } catch(err) {
        return {
            statusCode: err.code,
            body: err.message
        };
    }
};

async function getProductByIdFromDB(id): Promise<Product> {
    return Products.find(prod => prod.id === id);
}