<h1> @farfadev/ngx-svg </h1>

An [Angular](https://angular.dev/) directive and service to easily embed svg in html, such as svg icons, that can be styled and animated

<a href='https://stackblitz.com/github/farfadev/ngx-lib'>Run Showcase on Stackblitz</a><span> select SVG icons showcase</span>

<h2>installation</h2>
npm i @farfadev/ngx-svg

<h2>configuration</h2>

In the importing angular module, or the standalone host component:

```ts
import { FarfaSvgModule, FarfaSvgService } from "@farfadev/ngx-svg";
```

under the @NgModule or standalone @Component decorator

```ts
@Component({
  ...
  imports: [..., FarfaSvgModule, ...],
  ...
})
```
Inject the FarfaSvgService in the constructor of the host component that will embed SVGs

```ts
  constructor(private svgService: FarfaSvgService) {
  }
```
Under the NgOnInit lifecycle hook of the host component, load some SVGs (either from local asset directory or from a web url) and assign them a reference name

```ts
  ngOnInit() {
    this.svgService.loadSVG('myicon', 'assets/myicon.svg')
      .catch((error) => {
         // alert(error); 
      });
  }
```
In the html template of the host component, 

```html
<i style="display: inline-block; height: 1em; width: 1em" [farfa-svg]="{name: 'myicon'}">
<i class="myicon" [farfa-svg]="{name: 'myicon'}">
```
In the css stylesheet of the host component, 

```css
.myicon {
  display: inline-block;
  height: 1em;
  width: 1em;
}
```
