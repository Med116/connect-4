import { Action } from '@ngrx/store';

export enum HistoryActionTypes {
    YellowWins =  "[ HistoryState ] yellow wins",
    RedWins = "[ HistoryState ] red wins"
}

export class RedWinsAction implements Action{
    readonly type = HistoryActionTypes.RedWins;
    constructor(){};
}

export class YellowWinsAction implements Action{
    readonly type = HistoryActionTypes.YellowWins;
    constructor(){};
}

export type HistoryActionsUnion = RedWinsAction |   YellowWinsAction;
