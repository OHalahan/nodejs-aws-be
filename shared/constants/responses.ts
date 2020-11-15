import {HEADERS} from './headers';

export const RESPONSE = {
  _200: (data = {}) => ({
    headers: HEADERS,
    statusCode: 200,
    body: JSON.stringify(data)
  }),
  _202: (data = {}) => ({
    headers: HEADERS,
    statusCode: 200,
    body: JSON.stringify(data)
  }),
  _400: (data = {}) => ({
    headers: HEADERS,
    statusCode: 400,
    body: JSON.stringify(data)
  }),
  _404: (data = {}) => ({
    headers: HEADERS,
    statusCode: 404,
    body: JSON.stringify(data)
  }),
  _500: (data = {}) => ({
    headers: HEADERS,
    statusCode: 500,
    body: JSON.stringify(data)
  })
};
