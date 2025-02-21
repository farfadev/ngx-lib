import { ObjectEditor, Scheme } from './object-editor';

export interface ObjectEditorContext {
    value?: any;
    scheme?: Scheme;
    propertyName?: string | number;
    // called by the editor when value changes on editor side to update the service client
    editUpdate?: (c: any, p: string | number) => void;
    // called by the service client to change the context (value and scheme)
    contextChange?: (context: ObjectEditorContext) => void;
}
// examples
const e1: ObjectEditorContext = {
    value: {},
    scheme: {
        uibase: 'object',
        helper: "<article></article>",
        properties: {
            birthdate: {
                uibase: 'datetime',
                default: Date(),
            },
            address: {
                uibase: 'text',
            }
        }
    },
    editUpdate: (c: any, p: string | number): void => {
    },
    contextChange: (context: any): void => { }

};

