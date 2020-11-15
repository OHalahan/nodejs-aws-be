import {RESPONSE} from '../../shared/constants/responses';
import createEvent from '@serverless/event-mocks';
import {importProductsFile} from './importProductsFile';
import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';

describe('importProductsFile handler', () => {
  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.restore('S3');
  });

  describe('id is present', () => {
    it('should return 200 OK with signed URL', async () => {
      const mockEvent = createEvent('aws:apiGateway', {
        queryStringParameters: {
          name: 'test.csv'
        }
      } as any);

      AWSMock.mock('S3', 'getSignedUrl', (method, params, callback) => {
        return callback(null, `signedWith:${method}+directory:${params.Key}`);
      });

      const result = await importProductsFile(mockEvent);

      expect(result).toMatchObject(RESPONSE._200('signedWith:putObject+directory:uploaded/test.csv'));
    });
  });

  describe('id is not present', () => {
    it('should return 400 code with a message', async () => {
      const mockEvent = createEvent('aws:apiGateway', {
        queryStringParameters: ''
      } as any);

      const result = await importProductsFile(mockEvent);

      expect(result).toMatchObject(RESPONSE._400('Filename is not provided'));
    });
  });

  describe('getSignedUrl fails with an error', () => {
    it('should return 500 code with a message', async () => {
      const mockEvent = createEvent('aws:apiGateway', {
        queryStringParameters: {
          name: 'test.csv'
        }
      } as any);

      AWSMock.mock('S3', 'getSignedUrl', () => {
        throw new Error();
      });

      const result = await importProductsFile(mockEvent);

      expect(result).toMatchObject(RESPONSE._500('Internal Server Error'));
    });
  });
});
