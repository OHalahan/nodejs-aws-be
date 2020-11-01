import {APIGatewayProxyHandler} from "aws-lambda";
import { Products } from "data/products";
import { ResponseError } from "shared/classes/response-error";
import { Product } from "shared/models/product";

export const getProductsList: APIGatewayProxyHandler = async () => {

    try {

        const ProductsList = await getProductListFromDB();

        if (!ProductsList || !ProductsList.length) {
            throw new ResponseError({
                message: 'Products not found',
                code: 404
            });
        } else {
            return {
                statusCode: 200,
                body: JSON.stringify(ProductsList),
            };
        }

    } catch(err) {
        return {
            statusCode: err.code,
            body: err.message
        };
    }
};

async function getProductListFromDB(): Promise<Product[]> {
    return Products;
}