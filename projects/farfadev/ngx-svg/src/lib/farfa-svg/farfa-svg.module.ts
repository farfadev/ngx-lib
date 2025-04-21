import { NgModule } from "@angular/core";
import { FarfaSvgDirective } from "./farfa-svg.directive";
import { FarfaSvgService } from "./farfa-svg.service";

@NgModule({
    declarations: [
        FarfaSvgDirective
    ],
    providers: [
        FarfaSvgService
    ],
    imports: [
    ],
    exports: [
        FarfaSvgDirective
    ]
})
export class FarfaSvgModule { }
