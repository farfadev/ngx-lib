import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FarfaTooltipModule } from '@farfadev/ngx-a-tooltip';
import { FarfaSvgModule, FarfaSvgService } from "@farfadev/ngx-svg";

@Component({
  selector: 'showcases-icons-tooltip',
  templateUrl: './icons-tooltip.component.html',
  styleUrls: ['./icons-tooltip.component.scss'],
  imports: [CommonModule, FormsModule, FarfaSvgModule, FarfaTooltipModule],
})
export class ShowcaseIconsTooltipComponent implements OnInit {

  err_msg: string = '';
  testicon = { name: 'test' };

  constructor(private svgService: FarfaSvgService) {
  }

  nextState(event: Event) {
    let element: HTMLElement | null = event.currentTarget as HTMLElement | null;
    if(!element) return;
    let currentState = element.dataset?.['state'];
    let nextState = "";

    if (currentState == "EMPTY") {
      nextState = "ACTIVE";
    } else if (currentState == "ACTIVE") {
      nextState = "SUCCESS";
    } else if (currentState == "SUCCESS") {
      nextState = "ERROR";
    } else {
      nextState = "EMPTY";
    }

    element.dataset['state'] = nextState;
    currentState = nextState;
  }

  getIndicatorIcon() {
    return {
      svg: '\
      <svg viewBox="0 0 100 100" class="indicator-icon">\
      <path d="M0, 20 Q50, 20 100, 20"></path>\
      <path d="M0, 40 Q50, 40 100, 40"></path>\
      <path d="M0, 60 Q50, 60 100, 60"></path>\
      <path d="M0, 80 Q50, 80 100, 80"></path>\
    </svg>\
    '
    }
  }

  ngOnInit() {
    this.svgService.loadSVG('world-losange', 'assets/world-in-losange.svg')
      .catch((error) => {
        this.err_msg = 'Error importing SVG Icon \'assets/world-in-losange.svg\' : ' + error;
      });
    this.svgService.loadSVG('microphone', 'assets/microphone.svg')
      .catch((error) => {
        this.err_msg = 'Error importing SVG Icon \'assets/microphone.svg\' : ' + error;
      });

    let i = true;
    setInterval(() => {
      if (i) {
        this.svgService.loadSVG('changing-icon', 'assets/world-in-losange.svg')
          .catch((error) => {
            this.err_msg = 'Error importing SVG Icon \'assets/world-in-losange.svg\' : ' + error;
          });
        this.testicon = { name: 'world-losange' };
      }
      else {
        this.svgService.loadSVG('changing-icon', 'assets/microphone.svg')
          .catch((error) => {
            this.err_msg = 'Error importing SVG Icon \'assets/microphone.svg\' : ' + error;
          });
        this.testicon = { name: 'microphone' };
      }
      i = !i;
    }, 5000);
  }

}

