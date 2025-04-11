import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FarfaTooltipModule } from '@farfadev/ngx-a-tooltip';
import { FarfaIconModule, FarfaIconService } from "@farfadev/ngx-object-editor";

@Component({
  selector: 'showcases-icons-tooltip',
  templateUrl: './icons-tooltip.component.html',
  styleUrls: ['./icons-tooltip.component.scss'],
  imports: [CommonModule, FormsModule, FarfaIconModule, FarfaTooltipModule],
})
export class ShowcaseIconsTooltipComponent implements OnInit {

  err_msg: string = '';
  testicon = { name: 'test' };

  constructor(private iconService: FarfaIconService) {
  }

  ngOnInit() {
    let i = true;
    this.iconService.fetchSVGIcon('world-losange', 'assets/world-in-losange.svg')
      .catch((error) => {
        this.err_msg = 'Error importing SVG Icon \'assets/world-in-losange.svg\' : ' + error;
      });
    this.iconService.fetchSVGIcon('microphone', 'assets/microphone.svg')
      .catch((error) => {
        this.err_msg = 'Error importing SVG Icon \'assets/microphone.svg\' : ' + error;
      });

    setInterval(() => {
      if (i) {
        this.iconService.fetchSVGIcon('changing-icon', 'assets/world-in-losange.svg')
          .catch((error) => {
            this.err_msg = 'Error importing SVG Icon \'assets/world-in-losange.svg\' : ' + error;
          });
        this.testicon = { name: 'world-losange' };
      }
      else {
        this.iconService.fetchSVGIcon('changing-icon', 'assets/microphone.svg')
          .catch((error) => {
            this.err_msg = 'Error importing SVG Icon \'assets/microphone.svg\' : ' + error;
          });
        this.testicon = { name: 'microphone' };
      }
      i = !i;
    }, 1000);
  }

}

