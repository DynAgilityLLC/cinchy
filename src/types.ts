/*!
  Copyright (c) 2019 DynAgility LLC. All rights reserved.
  Licensed under the MIT License.
*/
export interface ApiResult<T> {
  status: number;
  requesting: boolean;
  error?: any;
  data: T;
}

export interface APIFetchAction {
  type: string;
  key: string;
  method: string;
  timeout?: number;
  error?: any;
  result?: any;
}

export interface AuthAction {
  type: string;
  error?: string;
  user?: any;
}

export interface AuthStrategy {
  getRequestOptions: (method, body) => Object;
  onUnauthorized: (dispatch, getState, request) => Promise<boolean>;
  onForbidden: (dispatch, getState, request) => Promise<boolean>;
  authenticate: (dispatch, credentials) => Promise<void>;
}

export type SubstitutionObject = {
  [key: string]: string;
};

export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';
