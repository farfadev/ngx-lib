<h1> @farfadev/ngx-a-tooltip </h1>

An [Angular](https://angular.dev/) component to popup a html tooltip on mouse hover/ click

<h2>installation</h2>
npm i @farfadev/ngx-a-tooltip

<h2>configuration</h2>
<br/>In the importing angular module, or the standalone component:
<br/><code>
import { ATooltipModule } from '@farfadev/ngx-a-tooltip';
</code>
<br/>under the @NgModule or @Component decorator
<br/><code>
imports: [..., ATooltipModule ,...]
</code>
</br>

<h2>utilisation</h2>
add the aTooltip attribute to your HTML element. the aTooltip value shall be an object with the following attribute:
<br/><code>html:</code>

the html content to display.
<br/><code>&lt;tagname [aTooltip]="{<span style='color:lightblue'>html: 'html to display'</span>}" /&gt;</code>
<br/><br/><code>style:</code>
<br/>an optional style
<br/><code>&lt;tagname [aTooltip]="{html: 'html to display',<span style='color:lightblue'>style: 'color: blue'</span>}" /&gt;</code>
<br/><br/><code>mode:</code>
<br/>click or hover mode option (default to hover). If 'click', the tooltip will popup on mouse click and vanish on another mouse click outside the popup. If 'hover', the tooltip will popup when the mouse pointer enters the HTML Element, and will vanish when the mouse pointer leaves the HTML Element.
<br/><code>&lt;htmltag [aTooltip]="{html: 'html(*) to display',<span style='color:lightblue'>mode: 'click'</span>,style: 'color: red'}" /&gt;</code>



