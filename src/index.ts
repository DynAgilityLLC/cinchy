/*!
  Copyright (c) 2019 DynAgility LLC. All rights reserved.
  Licensed under the MIT License.
*/
import { useContext, useCallback, useMemo, createContext } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { Map } from 'immutable';

import { APIClient, substituteParams } from './actions';

import { AuthStrategy, HttpMethod, SubstitutionObject } from './types';
import { AuthContext } from './auth';

const DETAULT_TIMEOUT = 60000; // One Minute Timeout

export function useAPI<T>(url: string, substitutions: SubstitutionObject = {}, method: HttpMethod = 'GET', key: string = url) {
  const auth: AuthStrategy = useContext(AuthContext);
  const dispatch = useDispatch();
  const substitutedKey = substituteParams(key, substitutions);
  const client: APIClient<T> = useMemo(() => new APIClient<T>(url, key, method, substitutions, auth), [url, key, method, substitutions]);
  const doRequest = (body, force = false, timeout = DETAULT_TIMEOUT) => dispatch(client.request(force, timeout, body));
  const data = useMappedState(useCallback(state => state.api.get(`${client.getKey()}:${client.getMethod()}`, Map({})).toJS(), [substitutedKey, method]));
  return [data, doRequest];
}

export { default as ApiReducer } from './reducer';
export { AuthStrategy, HttpMethod, SubstitutionObject } from './types';
export { AuthContext, JWTAuthStrategy, AuthReducer, mapUser } from './auth';