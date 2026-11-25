import type {State} from './types';
export function emptyState():State;
export function applyOperation(state:State,action:string,input:unknown,now:string):State;
