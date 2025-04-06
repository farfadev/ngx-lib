import { NgModule } from "@angular/core";
import { FarfaIconDirective } from "./farfa-icon.directive";
import { FarfaIconService } from "./farfa-icon.service";

@NgModule({
    declarations: [
        FarfaIconDirective
    ],
    providers: [
        FarfaIconService
    ],
    imports: [
    ],
    exports: [
        FarfaIconDirective
    ]
})
export class FarfaIconModule { }
