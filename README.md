# Base Router

An open source, community-driven fork of [Front Router by Zurb](https://github.com/zurb/front-router).

Base Router simplifies the creation of routes in AngularJS by allowing you to define them directly in your view templates.

State settings are defined in a [Front Matter](http://jekyllrb.com/docs/frontmatter/) block at the top of each template.

```html
---
name: post
url: /post/:id
controller: PostController
---

<h1>Post</h1>
```

Front Router parses each file, removing the Front Matter from the HTML and storing it in a JavaScript object of states. This object is saved as a new JavaScript file, which can be read by another library and converted into actual routes.

This library was developed for use with [Angular Base Apps](https://github.com/base-apps/angular-base-apps), a responsive web app framework from [Base Apps](https://github.com/base-apps), to simplify the process of prototyping single-page web apps.

## Install

Get started by installing base-router from npm.

```bash
npm install base-router --save
```

## Usage

Front Router is a Gulp plugin that takes in HTML files, removes the Front Matter, and returns the modified file. When the stream ends, the route data is written to disk as a new file.

```js
var gulp = require('gulp');
var router = require('base-router');

gulp.src('./src/templates/**/*.html')
  .pipe(router({
  output: './build/js/routes.js',
    root: './src/templates'
  }))
  .pipe(gulp.dest('./build/templates'));
```

Base Router accepts the following parameters:

  - **src** (String): root folder of the templates.
  - **dest** (String): filename to write the routes to.
  - **root** (String): Library to format routes file for.
  - **output** (String): Library to format routes file for.
  - **library** (String): Library to format routes file for.

When used with [angular-dynamic-routing](https://github.com/base-apps/angular-dynamic-routing), it is suggested to use  `$BaseAppsStateProvider` for configuring your routes.  You can do this by using the following `template`/`placeholder`:
  - **template**: `angular.module('dynamicRouting').config(['$BaseAppsStateProvider', function(BaseAppsStateProvider){ BaseAppsStateProvider.registerDynamicRoutes(<routes>); }]);`
  - **placeholder**: `<routes>`

## Front Matter Parameters

### name

**Required.** The name of the view. Refer to this when using `ui-sref` to link between views.

```
---
name: home
url: /
---
```

The `name` parameter can also use ui-router's dot notation to indicate a child view.

```
---
name: home.child
url: /child
---
```

### url

**Required.** Defines the URL at which a page can be directly accessed.

```
---
name: home
url: /
---
```

When setting up a child view, don't include the segment of the URL for the parent view&mdash;it will be inserted automatically.

```
---
name: parent.child
url: /child
---
```

 In the above example, the final URL is `/parent/child`, assuming the URL of the parent view is `/parent`.

 A URL can also contain parameters, which will be passed to the view's controller when it loads. Learn more about URL parameters on [ui-router's](https://github.com/angular-ui/ui-router/wiki/URL-Routing#url-parameters) documentation.

```
---
name: post
url: /post/:id
---
```

### animationIn

Sets a transition to play when the view animates in. Refer to the <a ui-sref="motion-ui">Motion UI</a> documentation to see the list of built-in transitions.

```
---
name: home
url: /
animationIn: slideInRight
---
```

### animationOut

Sets a transition to play when the view animates out. Refer to the [Motion UI](https://github.com/base-apps/angular-base-apps) documentation to see the list of built-in transitions.

```
---
name: home
url: /
animationIn: fadeIn
animationOut: fadeOut
---
```

### parent

Defines the parent view for the current one. You can use this as an alternative to the `parent.child` syntax.

```
----
name: child
parent: parent
url: /child
----
```

### controller

By default, all views use a controller called `DefaultController`, but this can be changed.

```
---
name: home
url: /
controller: HomeController
---
```

Among other things, the default controller passes a bunch of data through. For instance, all of your front-matter settings will be accessible via `vars` in your template. `{{ vars.name }}` will return the name of your route while `{{ vars.path }}` will return the relative path to the template.

Note that override a controller disables front-matter settings (except dynamic routing). If you want to use your own controller AND keep this feature, you can extend the `DefaultController`:</p>

```javascript
angular.module('application')
    .controller('MyController', MyController)
;

MyController.$inject = ['$scope', '$stateParams', '$state', '$controller'];

function MyController($scope, $stateParams, $state, $controller) {
  angular.extend(this, $controller('DefaultController', {
    $scope: $scope,
    $stateParams: $stateParams,
    $state: $state
  }));
  // Your code...
}
```

### abstract

Defines a state as abstract. Abstract states can have child states, but can't be navigated to directly. Check out the [ui-router documentation](https://github.com/angular-ui/ui-router/wiki/Nested-States-%26-Nested-Views#abstract-states) to learn more.

```
---
name: home
url: /
abstract: true
---
```
