import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EncuestaComponent } from "./encuesta.component";
import { HomeComponent } from "./home.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "encuesta/:id", component: EncuestaComponent },
  { path: "**", redirectTo: "" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
