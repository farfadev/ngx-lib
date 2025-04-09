# Publish angular libraries to NPM
## official docs
https://docs.npmjs.com/creating-and-publishing-scoped-public-packages

https://angular.dev/tools/libraries/creating-libraries#publishing-libraries

## tutorials from the community
https://sandroroth.com/blog/angular-library/

https://gpiskas.com/posts/how-to-build-angular-library-including-assets-styles/

https://dev.to/jsanddotnet/create-an-angular-library-and-consume-it-locally-with-debugging-cma

https://medium.com/angular-in-depth/complete-beginner-guide-to-publish-an-angular-library-to-npm-d42343801660

https://medium.com/@yamini.hrishikesh/building-a-library-in-angular-11-with-dependencies-2d34db752220

https://dev.to/leopold/build-and-publish-your-npm-package-48mb

## add a new library to project
ng generate library @farfadev/<library name>

## Local instructions to publish
to publish @farfadev/ngx-object-editor on npm:

&ensp;&ensp;increment version on ./projects/farfadev/ngx-object-editor/package.json

&ensp;&ensp;npm login (if not yet done)

&ensp;&ensp;npm run lib-oe:publish

to publish @farfadev/ngx-a-tooltip on npm:

&ensp;&ensp;increment version on ./projects/farfadev/ngx-a-tooltip/package.json

&ensp;&ensp;npm login (if not yet done)

&ensp;&ensp;npm run lib-at:publish
