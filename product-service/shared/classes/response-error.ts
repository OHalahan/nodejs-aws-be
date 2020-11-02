import { ErrorCode } from "../models/error-code";

export class ResponseError extends Error {
    code: ErrorCode;

    constructor(data){
        super(data.message);
        this.code = data.code;
    }
}