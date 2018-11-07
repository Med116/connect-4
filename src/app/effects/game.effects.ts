import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { GameActionsUnion, GameActionTypes, GameOver} from '../actions/game.actions';
import { HistoryActionsUnion, HistoryActionTypes} from '../actions/history.actions';
import { map } from 'rxjs/operators';

@Injectable()
export class GameEffects{

    constructor(public actions$: Actions){}

    gameOver$ = this.actions$.pipe(
        ofType<GameOver>(GameActionTypes.GameOver),
        map(action => {
            
        })

        
        )
}