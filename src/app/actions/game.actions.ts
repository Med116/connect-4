import { Action } from '@ngrx/store';

export enum GameActionTypes {
    PlayerMoved = '[Game Action] Player moved',
    GameOver = '[Game Action] Game Over',
}

export class PlayerMoved implements Action {
    readonly type = GameActionTypes.PlayerMoved;
    /**
     * payload is the color that just landed
     */
    constructor(public payload: string){
        
    }
}


export class GameOver implements Action {
    readonly type = GameActionTypes.GameOver;
    constructor(public currentTurn: string){};
}

export type GameActionsUnion = PlayerMoved | GameOver;