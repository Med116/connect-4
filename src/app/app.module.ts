import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { AppComponent } from './app.component';
import { QuadConnectComponent } from './quad-connect/quad-connect.component';
import { reducers } from './reducers/game.reducers';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    QuadConnectComponent,
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot(reducers),
    ReactiveFormsModule


  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
