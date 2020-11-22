import type {Serverless} from 'serverless/aws';
import {AWS_REGION, BUCKET_NAME, SOURCE_DIR} from './constants';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service'
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: AWS_REGION,
    apiGateway: {
      minimumCompressionSize: 1024
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
    },
    // Lambda access config
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: [`arn:aws:s3:::${BUCKET_NAME}`]
      },
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
      }
    ]
  },
  resources: {
    Resources: {
      // Configure bucket where uploaded and parsed files will be stored
      ImportParseBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: BUCKET_NAME,
          // Restrict public access
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            BlockPublicPolicy: true,
            IgnorePublicAcls: true,
            RestrictPublicBuckets: true
          },
          // Let PUT method be allowed only
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedHeaders: ['*'],
                AllowedMethods: ['PUT'],
                AllowedOrigins: ['*'],
                MaxAge: 0
              }
            ]
          }
        }
      }
    }
  },
  functions: {
    importProductsFile: {
      handler: 'handler.importProductsFileHandler',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            cors: true,
            request: {
              parameters: {
                querystrings: {
                  name: true
                }
              }
            }
          }
        }
      ]
    },
    importFileParser: {
      handler: 'handler.importFileParserHandler',
      events: [
        {
          s3: {
            bucket: BUCKET_NAME,
            event: 's3:ObjectCreated:*',
            rules: [{
              prefix: `${SOURCE_DIR}/`,
              suffix: '.csv'
            }],
            existing: true
          }
        }
      ]
    }
  }
};

module.exports = serverlessConfiguration;
