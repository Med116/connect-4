import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Observable, of, fromEvent, range, interval, Subscription, concat, combineLatest, from } from 'rxjs';
import { map, switchMap, filter, take, mergeMap, tap, last, takeUntil, debounceTime,flatMap, bufferTime } from 'rxjs/operators';
import { GameState, currentTurnSelector , numMovesSelector, gameHistorySelector, GameHistory} from '../reducers/game.reducers';
import { Store, select } from '@ngrx/store';
import { GameActionTypes, GameActionsUnion, PlayerMoved, GameOver } from '../actions/game.actions';
import { YellowWinsAction, HistoryActionsUnion, RedWinsAction } from '../actions/history.actions';
import { FormControl, FormGroup } from '@angular/forms';

export class SquareItem {

  x: number;
  y: number;
  color: string;
  moveNum: number;
  
}

@Component({
  selector: 'quad-connect',
  templateUrl: './quad-connect.component.html',
  styleUrls: ['./quad-connect.component.css']
})
export class QuadConnectComponent implements OnInit {

  dropping: Observable<boolean> = of(false);
  titleHtml: string = "==== Quad oooo Connect ====";

  side: number = 480;
  lines: number = 8;
  squareSize : number = this.side / this.lines;
  currentTurnColor$ : Observable<string>;
  numMoves$ : Observable<number>;
  dropClickSub : Subscription;
  playerFormGroup : FormGroup;

  @ViewChild('game')
  canvasElem : ElementRef;
  canvasContext : CanvasRenderingContext2D;
  squareItems : SquareItem[] = [];
  count:number = 0;
  redGamesWon$:  Observable<number>;
  yellowGamesWon$:  Observable<number>;
  redPlayer$: Observable<string>;
  yellowPlayer$: Observable<string>;
  currentPlayer$: Observable<string>;
  



  constructor(private store : Store<GameState>) {
    this.currentTurnColor$ = store.pipe(select(currentTurnSelector));

    this.currentTurnColor$.subscribe(curTurn => {

      if(curTurn === "red"){
        this.currentPlayer$ = this.redPlayer$;
      }

      if(curTurn === "yellow"){
        this.currentPlayer$ = this.yellowPlayer$;
      }

    });
    this.numMoves$ = store.pipe(select(numMovesSelector));
    store.pipe(select(gameHistorySelector)
      ,
      map(history =>{
        console.log("in map :" , history);
        this.redGamesWon$ = of(history.redWins);
        this.yellowGamesWon$ = of(history.yellowWins);
      })
    ).subscribe();
    
   }


  drawLines(){

      range(0,this.side).pipe(

      filter(i => {
        console.log("line: " + i);
        return i % (this.side / this.lines) == 0;
        
        })
        ,
      map( (num) => {

       
        return num;


      })
      

    ).subscribe((num)=>{
        console.log("NUM: "+ num);
        this.canvasContext.strokeStyle="white";
        this.canvasContext.lineWidth=2.0;
        this.canvasContext.moveTo( num, 0);
        this.canvasContext.lineTo(num, this.side);
        this.canvasContext.stroke();

        this.canvasContext.moveTo( 0, num);
        this.canvasContext.lineTo( this.side, num);
        this.canvasContext.stroke();
    });

  }

  ngOnInit() {
    
    let input = document.getElementById("example");
    
    let input$ = fromEvent( input , "keyup" ).pipe(
      bufferTime(1000)
    );

    input$.subscribe(typed =>{
      console.log("typed: " , typed);
    })



    this.playerFormGroup = new FormGroup({
      yellowPlayer : new FormControl(""),
      redPlayer : new FormControl("")
    }
    )
    
    this.playerFormGroup.valueChanges.subscribe(changes => {
      console.log("Form Changes: " );
      console.log(changes);
      this.redPlayer$ = of(changes.redPlayer);
      this.yellowPlayer$ = of(changes.yellowPlayer);

      this.currentTurnColor$.subscribe(curTurn => {

        if(curTurn === "red"){
          this.currentPlayer$ = this.redPlayer$;
        }
  
        if(curTurn === "yellow"){
          this.currentPlayer$ = this.yellowPlayer$;
        }
  
      });
      
    });
    
  
    
    this.canvasContext = 
    (this.canvasElem.nativeElement as HTMLCanvasElement).getContext('2d');

    this.resetCanvas();

 
 let game = document.getElementById("game");
 let x =  window.scrollX + game.getBoundingClientRect().left // X

 let y = window.scrollY + game.getBoundingClientRect().top;



 let dropClick$ = fromEvent(document.getElementById("game"), "click")
    .pipe(
      
      map((event: MouseEvent)=>{
      
      
      this.dropping = of(true);
      
      if(this.dropping){
       // return false;
      }
      
      this.count++;
      let gx = event.clientX;
      let gy = event.clientY;
      let xy : {x: number, y: number } = this.getPosition(event);

        console.log("XY : " , xy);
        

        console.log("=====");
        console.log("X: " + x + " Y: " + y);
        console.log("GX: " + gx + " GY: " + gy);
        console.log("=====");


        return [xy['x'],  xy['y']];
    }),

      map((point: [number,number]) =>{

        let xx: number = point[0];
        let yy : number = point[1];

        console.log(`${xx},${yy}`);
        let sqFrLeft = xx / this.squareSize;
        sqFrLeft = Math.ceil(sqFrLeft);
        console.log("SQ FR LEFT: " + sqFrLeft);

        return sqFrLeft - 1;

      }),
      map( (fromLeftZeroIndexed: number) =>{

          let indexToStart = fromLeftZeroIndexed;    
           let rectX = fromLeftZeroIndexed * this.squareSize;
           let rectY = this.side - (indexToStart * this.squareSize)
                              - this.squareSize;
           let sqColor = this.count % 2 === 0  ? "red" : "yellow";
           let currentSquareItem = new SquareItem();
           currentSquareItem.x = indexToStart;
           // defauly y pos to 0
           currentSquareItem.y = 0;
           // find existing y pos
           console.log("aq it");
           console.log(this.squareItems);
          let yCheck : SquareItem[] = this.squareItems.filter(item=>{
              return item.x === fromLeftZeroIndexed;
          });
          console.log("Y CHCK");
          console.log(yCheck);
          if(yCheck ){
            // found some in that column
             currentSquareItem.y = yCheck.length;
          }

           currentSquareItem.color = sqColor;
           currentSquareItem.moveNum = this.count;
           let dropCount = this.lines + 1 - currentSquareItem.y;
           this.squareItems = [ ... this.squareItems, currentSquareItem ];

           return {x: rectX , y: rectY , fromLeftZeroIndexed, dropCount}

      }),


    );
    


    
      let combined = combineLatest(this.dropping, dropClick$  ,
         (dropping, dropClick)=>{
            
          return {
              dropping,
              dropClick,
              
            }
      });


      let dropSub = combined.subscribe(droppingObject=>{

       let isDropping : boolean  = droppingObject.dropping.valueOf();
       if(isDropping){
          console.log("Is already dropping");
         // dropSub.unsubscribe();
       }
       else{
          this.dropping = of(true);
          let dropMillis = 100;
          console.log("ANIMATE ", droppingObject.dropClick );
          
          let xy = droppingObject.dropClick;
          let sqColor = this.count % 2 == 0 ? "red" : "yellow";

          interval(dropMillis).pipe(
              take(xy['dropCount'] + 1),
              map((dur)=>{
                    

                      console.log("XY DROP COUNT: " + xy['dropCount']);
                      let counter = dur;
                      counter++;
                      console.log("COUNTER: + " ,counter);
                      this.canvasContext.fillStyle = sqColor
                      let rectX = xy['fromLeftZeroIndexed'] * this.squareSize;
                      let rectY = counter * this.squareSize;
                      console.log("Filling rect at " + rectX + ", " + rectY);
                      let dropCountPLusOne: number = xy['dropCount']- 1;
                        if(counter <= dropCountPLusOne ){
                      
                      
                          this.drawCircle(rectX +1, rectY + 1, sqColor, "blue");
  
                      if(counter < dropCountPLusOne ){
                              setTimeout(
                                      ( )  =>  {
                                          
                                          
                                          this.drawCircle(rectX , rectY , "white", "white");
  
                                      },
                                      dropMillis
                                    )
                      }
                          
                      }
                
                      return sqColor;
                    
                  
                  
                  }),

            // only gets the last emitted drawn from the interval above                    // from the interval source 
            last(),
            debounceTime(500),


            ).subscribe(colorThatJustDropped =>{
              this.dropping = of(false);
              console.log("Last color: " + colorThatJustDropped);
              this.store.dispatch(new PlayerMoved(colorThatJustDropped))

              this.determineWinnerStatus();
            });
                
      
      }

      })
      
     /* this.dropClickSub = dropClick$.subscribe((colorThatJustDropped)=>{
        console.log("color just dropped");
        console.log(colorThatJustDropped);
      
        this.store.dispatch(new PlayerMoved(colorThatJustDropped))
        this.determineWinnerStatus();
        
      });
      */
    


  }

  determineWinnerStatus(){

    console.log(this.squareItems);
    let lastMove: SquareItem =this.squareItems.filter(x =>{
      return x.moveNum == this.squareItems.length;
    })[0];
    console.log("LAST MOVE: " );
    console.log(lastMove);

    // check points around the lastMove (left and right , above and below, diaganal bottom left to top right, diagonal top left to bottom right)
    let inARow: number = 1;
    let diagBottomLeftTopRightInARow = 1;
    let diagTopLeftToBottomRightInARow = 1;
    let currX = lastMove.x;
    let currY = lastMove.y;
    let currColor = lastMove.color;
    
    // termination flags
    let leftTerminated: boolean = false;
    let rightTerminated : boolean = false;
    let topTerminated: boolean = false;
    let diagBottomLeftToTopRightTerminated = false;
    let diagTopRightToBottomLeftTerminated = false;
    let diagTopLeftToBottomRightTerminated = false;
    let diagBottomRightToTopLeftTerminated = false;
    let bottomTerminated = false;
    
    let toLeftOf : number = currX - 1;
    let toRightOf: number = currX + 1;
    let below: number = currY - 1;
    let above: number = currY + 1;
    let plusXplusY = 1;
    let minusXMinusY= 1;
    let plusXMinusY = 1;
    let minusXPlusY = 1;


    while(rightTerminated === false ||
     leftTerminated === false || 
     topTerminated === false || 
     bottomTerminated === false || 
     diagBottomLeftToTopRightTerminated === false ||
     diagTopRightToBottomLeftTerminated === false ||
     diagTopLeftToBottomRightTerminated === false ||
     diagBottomRightToTopLeftTerminated === false



     ){
      if(toLeftOf < 0){
        leftTerminated = true;
        console.log("toLeft of < 0 : left terminated")
      }

      if(toRightOf > this.lines -1){
        rightTerminated = true;
        console.log("toRight of > " + (this.lines -1) + "  : right terminated");

      }
      if(below < 0){
        bottomTerminated = true;
        console.log("below of < 0 : bottom terminated")

      }

      if(above > this.lines -1){
        topTerminated = true;
        console.log("above of > " + (this.lines -1) + "  : top terminated");

      }

      // LEFT
      if(!leftTerminated){
        let leftOfItems: SquareItem[] =  this.squareItems.filter(item =>{
          return item.x === toLeftOf && item.color === lastMove.color && item.y === currY;
        });
        console.log("Left of items:");
        console.log(leftOfItems);
        if(leftOfItems && leftOfItems.length == 1){
          toLeftOf--;
          inARow++;
          console.log("Found One to left for " + currColor + " inarow=" + inARow );
        }
        else{
          leftTerminated = true;
          console.log("did not find a match on left, terminating left");
        }
      }


    // RIGHT
    if(!rightTerminated){
      let rightOfItems: SquareItem[] =  this.squareItems.filter(item =>{
          return item.x === toRightOf && item.color === lastMove.color && item.y === currY;
        });
        console.log("Right of items:");

        if(rightOfItems && rightOfItems.length == 1){
          toRightOf++;
          inARow++;
                  console.log("Found One to right for " + currColor + " inarow=" + inARow );

        }else{
          rightTerminated = true;
            console.log("did not find a match on right, terminating right");
        }
    }
  

      // TOP

    if(!topTerminated){
      let topOfItems: SquareItem[] =  this.squareItems.filter(item =>{
        return item.y === above && item.color === lastMove.color && item.x === currX;
      });
      console.log("TOP of items:");

      if(topOfItems && topOfItems.length == 1){
        above++;
        inARow++;
                console.log("Found One to top for " + currColor + " inarow=" + inARow );

      }else{
        topTerminated = true;
           console.log("did not find a match on top, terminating right");
      }

    }


      // BOTTOM

    if(!bottomTerminated){

          let bottomOfItems: SquareItem[] =  this.squareItems.filter(item =>{
            return item.y === below && item.color === lastMove.color && item.x === currX;
          });
          console.log("BOTTOM of items:");

          if(bottomOfItems && bottomOfItems.length == 1){
            below--;
            inARow++;
                    console.log("Found One to bottom for " + currColor + " inarow=" + inARow );

          }else{
            bottomTerminated = true;
              console.log("did not find a match on bottom, terminating right");
          }
    }


    // BOTTOM LEFT TO TOP RIGHT (plusXplusY)

    if(!diagBottomLeftToTopRightTerminated){
       let diagTopRightItems: SquareItem[] =  this.squareItems.filter(item =>{
            return item.y === currY + plusXplusY && item.color === lastMove.color && item.x === currX + plusXplusY;
          });
          console.log(" BOTTOM LEFT TO TOP RIGHT");
          console.log(diagTopRightItems);
    
      if(diagTopRightItems && diagTopRightItems.length == 1){
            plusXplusY++;
            diagBottomLeftTopRightInARow++;
                    console.log("Found One to top right for " + currColor + " inarow=" + inARow );
          }
          else{
            diagBottomLeftToTopRightTerminated = true;
          }
    
    
    }

    // TOP RIGHT TO BOTTOM LEFT (minusXminusY)

        if(!diagTopRightToBottomLeftTerminated){
       let diagTopRightToBottomLeftItems: SquareItem[] =  this.squareItems.filter(item =>{
            return item.y === currY - minusXMinusY && item.color === lastMove.color && item.x === currX - minusXMinusY;
          });
          console.log(" TOP RIGHT TO BOTTOM LEFT");
          console.log(diagTopRightToBottomLeftItems);
    
      if(diagTopRightToBottomLeftItems && diagTopRightToBottomLeftItems.length == 1){
            minusXMinusY++;
            diagBottomLeftTopRightInARow++;
                    console.log("Found One to bottom left for " + currColor + " inarow=" + inARow );

          }
          else{
            diagTopRightToBottomLeftTerminated = true;
          }
    
    
    }

    // t L B r
    // TOP LEFT TO BOTTOM RIGHT (plusXminusY)

    if(!diagTopLeftToBottomRightTerminated){
       let diagBottomRightItems: SquareItem[] =  this.squareItems.filter(item =>{
            return item.y === currY - plusXMinusY && item.color === lastMove.color && item.x === currX + plusXMinusY;
          });
          console.log(" TOP LEFT TO BOTTOM RIGHT");
          console.log(diagBottomRightItems);
    
      if(diagBottomRightItems && diagBottomRightItems.length == 1){
            plusXMinusY++;
            diagTopLeftToBottomRightInARow++;
                    console.log("Found One to bottom right for " + currColor + " inarow=" + inARow );

          }
          else{
            diagTopLeftToBottomRightTerminated = true;
          }
    
    }

    // BOTTOM RIGHT TO TOP LEFT (minusXPlusY)

    if(!diagBottomRightToTopLeftTerminated){
       let diagBottomRightItems: SquareItem[] =  this.squareItems.filter(item =>{
            return item.y === currY + minusXPlusY && item.color === lastMove.color && item.x === currX - minusXPlusY;
          });
          console.log(" BOTTOM RIGHT TO TOP LEFT");
          console.log(diagBottomRightItems);
    
      if(diagBottomRightItems && diagBottomRightItems.length == 1){
            minusXPlusY++;
            diagTopLeftToBottomRightInARow++;
                    console.log("Found One to top left for " + currColor + " inarow=" + inARow );

          }
          else{
            diagBottomRightToTopLeftTerminated = true;
          }
    
    
    }

      if(inARow >= 4){
        this.dispatchWin(lastMove.color, lastMove);
        break;
      }

      if(diagBottomLeftTopRightInARow >= 4){
        this.dispatchWin(lastMove.color, lastMove);
        break;
      }

      if(diagTopLeftToBottomRightInARow >= 4){
        this.dispatchWin(lastMove.color, lastMove);
        break;
      }
      console.log("IN A ROW: " + inARow);

    }




    // while top and bottom check
    this.dropping = of(false);


  } 

  private dispatchWin(color: string, lastMove: SquareItem){
    //alert("CONNECT 4! " + color + "  IS THE WINNER! ");

    if(color === "yellow"){
      this.store.dispatch(new YellowWinsAction());

    }
    else if (color === "red"){
      this.store.dispatch(new RedWinsAction());
    }




   // this.canvasContext.restore();
    this.count = 0;
    this.squareItems = [];
    
    
    this.canvasContext.fillStyle = "black";
    
    this.canvasContext.fillRect(0, this.squareSize,
       this.side, this.squareSize * 2 );
    
    this.canvasContext.strokeStyle = color;
    
    this.canvasContext.font = "45px courier";
    this.canvasContext.strokeText("CONNECT QUATTRO",0 ,this.squareSize * 2 );
    this.store.dispatch(new GameOver(color));

    setTimeout(()=>{ this.resetCanvas() }, 5000);
  
  }



  resetCanvas(){
    let canvasSide = this.squareSize * this.lines;
    this.canvasContext.fillStyle = "blue";
    this.canvasContext.fillRect(0,0,canvasSide,canvasSide);
    this.canvasContext.fill();
    this.drawLines();
  }

  drawCircle(topLeftX, topLeftY , fillColor, strokeColor, extraPadding = 0){
    this.canvasContext.beginPath();
    let radius = (this.squareSize  / 2 ) + extraPadding
    let x = topLeftX + radius  - extraPadding 
    let y = topLeftY - radius - extraPadding 
    this.canvasContext.lineWidth= 1;
    this.canvasContext.fillStyle = fillColor;
    this.canvasContext.arc(x,y,radius, 0 , Math.PI * 2);
    this.canvasContext.strokeStyle = "";
    //this.canvasContext.stroke();
    this.canvasContext.fill();
  }

 getPosition(e) {
  var rect = e.target.getBoundingClientRect();
  var x = e.clientX - rect.left  -1;
  var y = e.clientY - rect.top -1;
  return {
    x,
    y
  }
}

}