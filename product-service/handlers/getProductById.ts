import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { productsService } from "../shared/services/products";
import { ResponseError } from "../shared/classes/response-error";

import { HEADERS } from "../shared/constants/headers";

export const getProductById = async (event: APIGatewayProxyEvent) => {

    try {

        const { id } = event.pathParameters || {};

        if (id === null || id === undefined || id === '') {
            throw new ResponseError({
                message: 'No ID provided',
                code: 400
            });
        }

        const product = await productsService.getProductByIdFromDB(+id);

        if (!product) {
            throw new ResponseError({
                message: 'Product not found',
                code: 404
            });
        }

        return {
            headers: HEADERS,
            statusCode: 200,
            body: JSON.stringify(product)
        };

    } catch(err) {
        return {
            statusCode: err.code || 500,
            body: err.message || 'Internal Server Error'
        };
    }
};

export const getProductByIdHandler: APIGatewayProxyHandler = async (event) => {
    return getProductById(event);
};