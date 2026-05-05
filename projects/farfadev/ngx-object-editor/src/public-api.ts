/*
 * Public API Surface of ngx-object-editor
 */

//export * from './lib/ngx-object-editor.service';
export * from './lib/component/object-editor.component';
export * from './lib/object-editor.module';
export * from './lib/adjust/adjust-number';
export * from './lib/adjust/adjust-dms';
export * from './lib/input/input-socket';
export * from './lib/imasks/dms-mask';
export type { UIBase, Scheme, Context, BaseContext, Signal } from './lib/object-editor-decl';
export  { signal } from './lib/object-editor-decl';
export * from './lib/object-editor-chimere';
export { createContext, checkScheme } from './lib/object-editor-init';
