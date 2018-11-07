import { GameActionsUnion, GameActionTypes } from '../actions/game.actions';
import { HistoryActionTypes , HistoryActionsUnion } from '../actions/history.actions';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store'; 
  
/**
 * All "sub" states go in this OverallState. 
 */
  export interface OverallState{
    gameState: GameState;
    historyState: HistoryState
  }
   

  export class GameHistory{
    redWins: number;
    yellowWins : number;
  }

  export interface HistoryState{
    gameHistory: GameHistory;


  }

   export interface GameState {
     currentTurn : string;
     numMoves : number;
   }
   
   
   const initialGameState : GameState = {
       
         currentTurn: "yellow",
         numMoves: 0
   }
   
   const initHistoryState = new GameHistory();
   initHistoryState.redWins = 0;
   initHistoryState.yellowWins = 0;
   const initialHistoryState : HistoryState =
     { gameHistory : initHistoryState };
   
   
   
  export function historyStateReducer(
    state : HistoryState = initialHistoryState,
    action : HistoryActionsUnion ) : HistoryState {

      console.log("==== REDUCING HISTORY STATE =====");
      console.log(state);
      let redWins = state.gameHistory.redWins;
      let yellowWins = state.gameHistory.yellowWins;
     
      if(action.type === HistoryActionTypes.RedWins){
        redWins++;
      }

      if(action.type === HistoryActionTypes.YellowWins){
        yellowWins++;
      }

      console.log("red, "+ redWins + ", yellowWins=" + yellowWins);
      return { gameHistory : {redWins , yellowWins}};
    
    }

   
   export function gameStateReducer(
     state: GameState = initialGameState,
     action: GameActionsUnion 
   ) : GameState {
   
     
   
     switch (action.type) {
       case GameActionTypes.PlayerMoved:
         let numMoves = state.numMoves +1;
         let currentTurn =  action.payload === "yellow" ? "red" : "yellow";
         return {
           numMoves,currentTurn
         }
         case GameActionTypes.GameOver:
       return state

       case GameActionTypes.GameOver:
         return {
           numMoves: 0,
           currentTurn: action.currentTurn
         }
     
       default:
         return state;
     }
   
   }
   

// SELECTORS : 

  export const gameStateFeatureSelector =
    createFeatureSelector<GameState>("gameState");


  export const currentTurnSelector = createSelector(gameStateFeatureSelector, 
    (gameState) => { return gameState.currentTurn}
    );

    export const numMovesSelector = createSelector(gameStateFeatureSelector,
      (gameState)=> {
        return gameState.numMoves;
      });

  export const historyStateFeatureSelector =
   createFeatureSelector<HistoryState>("historyState");

  export const gameHistorySelector = createSelector(historyStateFeatureSelector,
    (historyState) => historyState.gameHistory)
    

  export const reducers: ActionReducerMap<OverallState> = {
     gameState: gameStateReducer,
     historyState:  historyStateReducer
  }