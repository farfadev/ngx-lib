<h1> @farfadev/ngx-svg </h1>

An [Angular](https://angular.dev/) directive and service to easily embed svg in html, such as svg icons, that can be styled and animated

<a href='https://stackblitz.com/github/farfadev/ngx-lib'>Run Showcase on Stackblitz</a><span> select SVG icons showcase</span>

<h2>installation</h2>
npm i @farfadev/ngx-svg

<h2>configuration</h2>

<h3>pre-load some SVGs</h3>
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
Inject the FarfaSvgService in the constructor of the host component that will load SVGs

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
<h3>reference pre-loaded SVGs</h3>
You can now reference the loaded SVGs in the html templates of components that import the FarfaSvgModule, 
<br><br>
in the typescript file of the component,

```ts
// component.ts
@Component({
  ...
  imports: [..., FarfaSvgModule, ...],
  ...
})
```
In the html template of the component, 

```html
<!-- component.html -->
<!-- with inline style -->
<i style="display: inline-block; height: 1em; width: 1em" [farfa-svg]="{name: 'myicon'}">
<!-- or with css class -->
<i class="myicon" [farfa-svg]="{name: 'myicon'}">
```
In the css stylesheet of the component, 

```css
.myicon {
  display: inline-block;
  height: 1em;
  width: 1em;
}
```

<h3>embed SVGs for single use</h3>
If you need to reference the SVG only once, the svg can be directly embeded via the svg attribute of the [farfa-svg] directive

```html
<!-- embed inline SVG -->
<i class="myicon" [farfa-svg]="{svg: '<svg viewBox=&quot;0 0 100 100&quot;><path d=&quot;M0, 20 Q50, 20 100, 20&quot;></path></svg>'}">

<!-- embed SVG from URL -->
<i class="myicon" [farfa-svg]="{svg: '/assets/mySvgFile.svg'}">

```