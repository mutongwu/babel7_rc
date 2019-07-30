## babel7.4+的问题

> babel从6升级到7，有比较大到变化，详细查看：[升级指南](https://babeljs.io/docs/en/v7-migration)

> 但是，7.4（March 19, 2019）以后，又有一个明显的升级，主要涉及babel-polyfill的变化，[不再推荐使用了](https://babeljs.io/docs/en/babel-polyfill)。

### 使用方式变化：
```javascript
// deprecated
// import 'babel-polyfill'

// to polyfill ECMAScript features
import "core-js/stable"; 
// needed to use transpiled generator functions
import "regenerator-runtime/runtime"; 
```

### 原因是？ 
* 通常我们对代码做转换，引入的是 @babel/preset-env，对于浏览器不支持的特性，需要 babel-polyfill来搭救。
* babel-polyfill 内部引用了 core-js 的库。[源码](https://github.com/babel/babel/blob/cf4bd8bb8d7e9feb7de8d97ef0eabcdc7499fce2/packages/babel-polyfill/src/index.js)
* 如今，core-js有了两个版本: core-js@2 和 core-js@3,两者互不兼容。而babel7.4+ 更推荐使用 core-js@3 版本。
* 那么 core-js@2 vs core-js@3 有何不同？[官方说明](https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md), 大概有几点：
  * core-js@2 大概自2018年中开始冻结代码，新特性只在core-js@3中体现
  * 一些原本是作为提案的特性，现在已经是正式的标准了（ ES2016-ES2019 ）例如：
    * Promise.prototype.finally method (ECMAScript 2018)
    * String.prototype.padStart and String.prototype.padEnd methods (ECMAScript 2017)
  * 删除过时的方法，如 Array.prototype.flatten
  * bug修复（Array#reverse broken in Safari 12 ）
  * 支持新的提案方法
  * 通过 core-js-compat 这个库来判断polyfill，而不是使用 compat-table。

### 使用方式变更：
* @babel/preset-env （记得升级到7.4+） 有个配置项 **useBuiltIns** ，它有三个可选值：
  * false: 默认值，表示不处理 polyfill。如果是跟webpack结合使用，可以在entry指定手动引入使用：
  ```javascript
  module.exports = {
    entry: ["@babel/polyfill", "./app/js"]
  };
  ```
  * entry: 浏览器特性的全量补丁，要求我们代码的入口处，显式写入上面2句代码引入
  * usage: 部分补丁方式，表示仅polyfill代码中使用到的特性。鉴于打包体积的问题，通常这个会是我们的首选配置。
* 配置方式(.babelrc)：
    ```json
    {
        "presets": [
            [
            "@babel/preset-env",
            {
                "targets": {
                    "safari": "8",
                    "android": "4.1"
                },
                "corejs": "3", //  defaults to 2
                "useBuiltIns": "usage"
            }
            ]
        ]
    }
    ```
    注意这里面的"corejs"选项，如果不指定，则babel会warning：
    ```
    WARNING: We noticed you're using the `useBuiltIns` option without declaring a core-js version. Currently, we assume version 2.x when no version is passed. Since this default version will likely change in future versions of Babel, we recommend explicitly setting the core-js version you are using via the `corejs` option.

    You should also be sure that the version you pass to the `corejs` option matches the version specified in your `package.json`'s `dependencies` section. If it doesn't, you need to run one of the following commands:

    npm install --save core-js@2    npm install --save core-js@3
    yarn add core-js@2              yarn add core-js@3
    ```
    OK,babel给出的提示很明显了，我们需要指定core-js的版本，同时安装对应的依赖包。
    
    ```javascript
    // we don't need it anymore
    // npm uninstall @babel/polyfill

    npm install --save core-js@3
    ```
### 优化代码体积
虽然我们已经完成了对代码的polyfill，但是这里有个问题，babel 在每个需要的文件的顶部都会插入一些 helpers 内联代码，这可能会导致多个文件都会有重复的 helpers 代码。[@babel/plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime) 的 helpers 选项就可以把这些模块抽离出来。为此，我们需要安装2个包：
> 其实@babel/plugin-transform-runtime 还有另外一个功能，就是能够在添加polyfill特性的时候，不会污染全局对象。
```
// version 7.4+
npm install --save-dev @babel/plugin-transform-runtime
npm install --save @babel/runtime
```
则 .babelrc修改后变为：
```json
{
    "presets": [
        [
        "@babel/preset-env",
        {
            "targets": {
                "safari": "8",
                "android": "4.1"
            },
            "corejs": "3", //  defaults to 2
            "useBuiltIns": "usage"
        }
        ]
    ],
    "plugins":["@babel/plugin-transform-runtime"]
}
```
效果举例：
```javascript
// source code
class Circle {}
```
```javascript
// without plugin-transform-runtime
function _classCallCheck(instance, Constructor) {
  //...
}

var Circle = function Circle() {
  _classCallCheck(this, Circle);
};
```
```javascript
// with plugin-transform-runtime
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var Circle = function Circle() {
  _classCallCheck(this, Circle);
};
```
但是，这里其实还有问题，那就是@babel/plugin-transform-runtime 在使用 @babel/runtime 的时候，其实有多个版本选择：  
corejs option| Install command | note |
--| -- | --
false | npm install --save @babel/runtime | 
2 | npm install --save @babel/runtime-corejs2 | 只支持全局对象和静态方法（eg. Promise, Array.from）
3 | npm install --save @babel/runtime-corejs3 | 额外支持实例方法(eg. [].includes())

因此，配套使用效果自然更好，我们重新安装一下：
```
npm uninstall  @babel/runtime
npm install --save @babel/runtime-corejs3

```
babelrc 最后的配置：
```json
{
    "presets": [
        [
        "@babel/preset-env",
        {
            "targets": {
                "safari": "8",
                "android": "4.1"
            },
            "corejs": "3", //  can also be a specific version： 3.1
            "useBuiltIns": "usage"
        }
        ]
    ],
    "plugins":["@babel/plugin-transform-runtime",{"corejs": 3}]
}
```
#### 附
* https://babeljs.io/docs/en/next/babel-polyfill
* https://babeljs.io/blog/2019/03/19/7.4.0
* https://juejin.im/post/5cb9833b6fb9a068a84fe4d0#heading-22