import {APIGatewayProxyEvent, APIGatewayProxyHandler} from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';

import {AWS_REGION, BUCKET_NAME, SOURCE_DIR} from '../constants';
import {RESPONSE} from '../../shared/constants/responses';

export const importProductsFile = async (event: APIGatewayProxyEvent) => {
  const s3 = new AWS.S3({region: AWS_REGION});

  const {name} = event.queryStringParameters;

  if (!name) {
    return RESPONSE._400('Filename is not provided');
  }

  console.log(`FILENAME: ${name}`);

  const catalogPath = `${SOURCE_DIR}/${name}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: catalogPath,
    Expires: 60,
    ContentType: 'text/csv'
  };

  try {
    const url = await s3.getSignedUrlPromise('putObject', params);
    console.log(`SIGNED URL: ${url}`);

    return RESPONSE._200(url);
  } catch (e) {
    console.log('FAILED TO GET SIGNED URL: ', e);

    return RESPONSE._500('Internal Server Error');
  }
};

export const importProductsFileHandler: APIGatewayProxyHandler = async (event) => {
  return importProductsFile(event);
};
