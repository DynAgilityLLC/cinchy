/*!
  Copyright (c) 2019 DynAgility LLC. All rights reserved.
  Licensed under the MIT License.
*/
import { Map, List } from 'immutable';

import {
  FETCH_URL_START,
  FETCH_URL_SUCCESS,
  FETCH_URL_FAILED,
  FETCH_URL_RESET
} from './constants';

import { APIFetchAction } from './types';

const initialState = Map({});

const actionHandlers: { [key: string]: (s: Map<string, any>, a: APIFetchAction) => Map<string, any> } = {};

actionHandlers[FETCH_URL_START] = (state: Map<string, any>, { key, method, timeout }: APIFetchAction): Map<string, any> =>
  state.setIn([`${key}:${method}`, 'requesting'], true).removeIn([`${key}:${method}`, 'error']).setIn([`${key}:${method}`, 'timeout'], timeout);

actionHandlers[FETCH_URL_SUCCESS] = (state: Map<string, any>, { key, method, result }): Map<string, any> => {
  const data = Array.isArray(result) ? List(result) : Map(result);
  return state.setIn([`${key}:${method}`, 'requesting'], false).setIn([`${key}:${method}`, 'data'], data).setIn([`${key}:${method}`, 'statuscode'], result.statuscode);
};

actionHandlers[FETCH_URL_FAILED] = (state: Map<string, any>, { key, method, error }: APIFetchAction): Map<string, any> =>
  state.setIn([`${key}:${method}`, 'requesting'], false).removeIn([`${key}:${method}`, 'data']).setIn([`${key}:${method}`, 'error'], error).setIn([`${key}:${method}`, 'statuscode'], error.statuscode);

actionHandlers[FETCH_URL_RESET] = (state: Map<string, any>, { key, method }: APIFetchAction) => state.remove(`${key}:${method}`);

export default (state: Map<string, any> = initialState, action: APIFetchAction) => {
  const nextState = (actionHandlers[action.type] ? actionHandlers[action.type](state, action) : undefined);
  return (nextState !== null && nextState !== undefined ? nextState : state);
};
