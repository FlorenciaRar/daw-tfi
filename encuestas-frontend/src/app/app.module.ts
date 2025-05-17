import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app.routes"; // <--- Importa tu módulo de rutas
import { HomeComponent } from "./home.component";
import { EncuestaComponent } from "./encuesta.component";

@NgModule({
  declarations: [AppComponent, HomeComponent, EncuestaComponent],
  imports: [
    BrowserModule,
    AppRoutingModule, // <--- Agrega aquí
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
