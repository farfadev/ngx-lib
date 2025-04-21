<h1> @farfadev/ngx-a-tooltip </h1>

An [Angular](https://angular.dev/) component to popup a html tooltip on either a mouse hover or click

<a href='https://stackblitz.com/github/farfadev/ngx-lib'>Run Showcase on Stackblitz</a><span> Select tooltip showcase</span>

<h2>installation</h2>
npm i @farfadev/ngx-a-tooltip

<h2>configuration</h2>
In the importing angular module, or the standalone component:

```ts
import { FarfaTooltipModule } from '@farfadev/ngx-a-tooltip';
```
under the @NgModule or @Component decorator

```ts
imports: [..., FarfaTooltipModule ,...]
```

<h2>utilisation</h2>
add the farfa-tooltip attribute to your HTML element. the farfa-tooltip value shall be an object with the following properties:
<pre>
html: the html to display
mode: 'hover' or 'click', default to 'hover'. 
style: the style of the tooltip
</pre>

```html
<div [farfa-tooltip]="{
    html: '<div><span style=\'color:blue;\'>HELLO</span></div>',
    mode: 'hover',
    style: 'border-radius:15px;background-color:#FAA0A0;'
  }">...</div>
```
