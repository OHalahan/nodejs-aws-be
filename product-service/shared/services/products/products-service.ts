import { Products } from "../../../data/products";
import { Product } from "../../models/product";

export async function getProductByIdFromDB(id: number): Promise<Product> {
    return Products.find((prod: Product) => prod.id === id);
}

export async function getProductsFromDB(): Promise<Product[]> {
    return Products;
}