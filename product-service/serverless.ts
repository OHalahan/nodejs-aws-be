import type {Serverless} from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service'
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: [
    'serverless-webpack',
    'serverless-dotenv-plugin'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST: process.env.PG_HOST,
      PG_PORT: process.env.PG_PORT,
      PG_DATABASE: process.env.PG_DATABASE,
      PG_USERNAME: process.env.PG_USERNAME,
      PG_PASSWORD: process.env.PG_PASSWORD
    }
  },
  functions: {
    getProductsList: {
      handler: 'handler.getProductsListHandler',
      events: [
        {
          http: {
            method: 'get',
            path: '/products',
            cors: true
          }
        }
      ]
    },
    getProductById: {
      handler: 'handler.getProductByIdHandler',
      events: [
        {
          http: {
            method: 'get',
            path: '/products/{id}',
            cors: true
          }
        }
      ]
    },
    createProduct: {
      handler: 'handler.createProductHandler',
      events: [
        {
          http: {
            method: 'post',
            path: 'products',
          }
        }
      ]
    }
  }
};

module.exports = serverlessConfiguration;
