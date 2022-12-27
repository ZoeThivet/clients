import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { SMExportComponent } from "./export/sm-export.component";
import { SMImportComponent } from "./import/sm-import.component";

const routes: Routes = [
  {
    path: "import",
    component: SMImportComponent,
    data: {
      title: "importData",
    },
  },
  {
    path: "export",
    component: SMExportComponent,
    data: {
      title: "exportData",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
