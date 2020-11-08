import {APIGatewayProxyHandler} from "aws-lambda";
import { HEADERS } from "../shared/constants/headers";
import { ResponseError } from "../shared/classes/response-error";
import { productsService } from "../shared/services/products";

export const getProductsList = async () => {

    try {

        const ProductsList = await productsService.getProductsFromDB();

        if (!ProductsList || !ProductsList.length) {
            throw new ResponseError({
                message: 'Products not found',
                code: 404
            });
        } else {
            return {
                headers: HEADERS,
                statusCode: 200,
                body: JSON.stringify(ProductsList),
            };
        }

    } catch(err) {
        return {
            statusCode: err.code || 500,
            body: err.message || 'Internal Server Error'
        };
    }
};


export const getProductsListHandler: APIGatewayProxyHandler = async () => {
    return getProductsList();
};