/*!
  Copyright (c) 2019 DynAgility LLC. All rights reserved.
  Licensed under the MIT License.
*/
import { useCallback, createContext } from 'react';
import { Record } from 'immutable';
import { useMappedState } from 'redux-react-hook';
import jwt from 'jsonwebtoken';

import { AuthStrategy, AuthAction } from './types';

import {
  FAIL_AUTH,
  SUCCESS_AUTH,
} from './constants';

const successAuth = (user) => ({type: SUCCESS_AUTH, user});
const failAuth = (error: any) => ({ type: FAIL_AUTH, error });

export const DefaultAuthStrategy: AuthStrategy = {
  getRequestOptions: (method, body) => ({ method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  onUnauthorized: async (dispatch, getState, request) => {
    dispatch(failAuth(request));
    return false;
  },
  onForbidden: async (dispatch, getState, request) => {
    dispatch(failAuth(request));
    return false;
  },
  authenticate: async (dispatch, credentials) => undefined
};

export class JWTAuthStrategy implements AuthStrategy  {
  private refreshJWTUrl: string | undefined;
  private authenticateUserUrl: string;
  constructor(authenticateUserUrl: string, refreshJWTUrl: string | undefined) {
    this.authenticateUserUrl = authenticateUserUrl;
    this.refreshJWTUrl = refreshJWTUrl;
  }
  private jwt: string | undefined;
  async tryRefreshJWT(dispatch, getState, request): Promise<boolean> {
    if (this.refreshJWTUrl !== undefined) {
      const request = await fetch(this.refreshJWTUrl, { headers: { 'Authorization': `BEARER ${this.jwt}` } });
      if (request.status === 200) {
        const response = await request.json();
        this.jwt = response.jwt;
        return true;
      }
    }
    this.jwt = undefined;
    dispatch(failAuth(request));
    return false;
  }
  getRequestOptions(method, body): object {
    const headers = { 'Content-Type': 'application/json' };
    if (this.jwt !== undefined) {
      headers['Authorization'] = `BEARER ${this.jwt}`;
    }
    return {
      method,
      body: JSON.stringify(body),
      headers
    };
  }
  async authenticate(dispatch, credentials) {
    const request = await fetch(this.authenticateUserUrl, { method: 'POST', body: JSON.stringify(credentials), headers: { 'Content-Type': 'application/json' }});
    if (request.status === 200) {
      this.jwt = await request.text();
      dispatch(successAuth(jwt.decode(this.jwt)));
    } else {
      dispatch(failAuth(await request.json()));
    }
  }
  async onUnauthorized(dispatch, getState, request) {
    return this.tryRefreshJWT(dispatch, getState, request);
  }
  async onForbidden(dispatch, getState, request) {
    return this.tryRefreshJWT(dispatch, getState, request);
  }
}

export const AuthContext = createContext(DefaultAuthStrategy);
export const AuthReducer = (state: Record<any> | null = null, action: AuthAction) => {
  if (action.type === 'SUCCESS_AUTH') {
    return action.user;
  } else if (action.type === 'FAIL_AUTH') {
    return null;
  }

  return state;
};
export const mapUser = () => useMappedState(useCallback(state => state.auth, []));
