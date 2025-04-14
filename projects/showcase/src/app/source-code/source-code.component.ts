import { Component, ComponentFactoryResolver, Input, OnInit } from '@angular/core';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import scss from 'highlight.js/lib/languages/scss';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/github.css';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'source-code',
  imports: [CommonModule],
  templateUrl: './source-code.component.html',
  styleUrl: './source-code.component.scss'
})
export class FarfaSourceCodeComponent implements OnInit {
  _sources?: Record<string, string> = {};
  @Input()
  set sources(sources: Record<string, any> | undefined) {
    this._sources = sources;
    this.loadSourceCode();
  };
  get sources() {
    return this._sources;
  }

  getSourcesKeys() {
    return (Object.keys(this.sources ?? {}));
  }

  constructor(private route: ActivatedRoute) {
    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('typescript', typescript);
    hljs.registerLanguage('json', json);
    hljs.registerLanguage('xml', xml);
    hljs.registerLanguage('scss', scss);
    hljs.registerLanguage('css', css);
  }

  ngOnInit() {
  }

  openSourceCode(evt: Event, sourceType: string) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      (tabcontent[i] as any).style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    const el = document.getElementById(sourceType);
    if (el) el.style.display = "block";
    (evt.currentTarget as any).className += " active";
  }

  loadSourceCode() {
    const sources = this.sources;
    for (const sourceType of Object.keys(sources ?? {})) {
      const source = sources?.[sourceType];
      if (source.url) {
        fetch(source.url).then((res: Response) => {
          if (res.status >= 200 && res.status < 300) {
            res.body?.getReader().read().then(async (value: ReadableStreamReadResult<Uint8Array>) => {
              if (value?.value) {
                try {
                  let str = utf8ArrayToStr(value.value);
                  str = hljs.highlightAuto(str).value;
                  const el = document.getElementById(sourceType + '-toto');
                  if (el) el.innerHTML = str;
                }
                catch (e) {
                  const i = 0;
                }
              }
            });
          }
        })
          .catch((reject) => {
            const i = 0;
          });
      }
      else if (source.data) {
        const str = hljs.highlightAuto(source.data).value;
        const el = document.getElementById(sourceType + '-toto');
        if (el) el.innerHTML = str;
      }
    }
  }
}
const utf8ArrayToStr = (array: Uint8Array) => {
  var out, i, len, c;
  var char2, char3;

  out = "";
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
          ((char2 & 0x3F) << 6) |
          ((char3 & 0x3F) << 0));
        break;
    }
  }
  return out;
}
