/*!
  Copyright (c) 2019 DynAgility LLC. All rights reserved.
  Licensed under the MIT License.
*/
import { APIFetchAction, AuthStrategy, HttpMethod, SubstitutionObject } from './types';

import {
  FETCH_URL_START,
  FETCH_URL_SUCCESS,
  FETCH_URL_FAILED,
  FETCH_URL_RESET,
} from './constants';

const DEFAULT_TIMEOUT = 60000; // One Minute

export const substituteParams = (str: string, params: { [key: string]: string } | undefined ): string => (params !== undefined ? Object.keys(params).reduce((current, key) => current.replace(`{${key}}`, params[key]), str) : str);

const startFetch = (key: string, method: string, timeout: number): APIFetchAction => ({ type: FETCH_URL_START, key, method, timeout });
const successFetch = (key: string, method: string, result: any): APIFetchAction => ({ type: FETCH_URL_SUCCESS, key, method, result });
const failFetch = (key: string, method: string, error: any): APIFetchAction => ({ type: FETCH_URL_FAILED, key, method, error });
export const resetState = (key: string, method: string): APIFetchAction => ({ type: FETCH_URL_RESET, key, method });

export class APIClient<T> {
  private authStrategy: AuthStrategy;
  private url: string;
  private key: string;
  private method: HttpMethod;

  constructor(url: string, key: string, method: HttpMethod, substitutions: SubstitutionObject, authStrategy: AuthStrategy) {
    this.authStrategy = authStrategy;
    this.url = substituteParams(url, substitutions);
    this.key = substituteParams(key, substitutions);
    this.method = method;
  }

  getKey() {
    return this.key;
  }

  getMethod() {
    return this.method;
  }

  getUrl() {
    return this.url;
  }

  request<T>(force: boolean = false, timeout: number = DEFAULT_TIMEOUT, body?: any): (d: Function, g: Function) => Promise<T | undefined> {
    return async (dispatch: Function, getState: Function): Promise<T | undefined> => {
      dispatch(startFetch(this.key, this.method, Date.now() + timeout));
      try {
        // We want to be able to signal that we should retry the request because our auth strategy
        // tried something that will maybe fix the auth problem (see JWTAuthStrategy)
        // By default, this should run once.
        let initial: boolean = true;
        let retry: boolean | undefined = false;
        let response: any = {};
        while (initial === true || retry === true) {
          // After the initial run, only run again if retry is true.
          initial = false;

          const requestOptions = this.authStrategy.getRequestOptions(this.method, body);
          const request = await fetch(this.url, requestOptions);
          response = await request.json();
          response.statuscode = request.status;
          if (request.status > 299) {
            if (response.status === 401) {
              retry = await this.authStrategy.onUnauthorized(dispatch, getState, request);
            } else if (response.status === 403) {
              retry = await this.authStrategy.onForbidden(dispatch, getState, request);
            } else {
              dispatch(failFetch(this.key, this.method, response));
            }
          } else {
            dispatch(successFetch(this.key, this.method, response));
          }
        }
        return response;
      } catch (e) {
        dispatch(failFetch(this.key, this.method, e));
      }
    };
  }
}
