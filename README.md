# pnpm-monorepo-pilot

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

> 基于pnpm monorepo的脚本执行工具，可以在根目录通过交互命令，快速执行项目脚本，以及会记录历史使用过的脚本达到快速执行


## 安装

```bash
npm install pnpm-monorepo-pilot -g
```

## 使用

```bash
Usage: index [options]

Options:
  -s, --scan-root                  是否扫描根目录下的package.json (default: false)
  -sh, --skip-history              跳过历史脚本选择 (default: false)
  -si, --skip-interactive [index]  跳过交互选择界面,直接执行
  -r, --root [root]                扫描的目录
  -v, --version                    版本号
  -h, --help                       display help for command
```
### 当子模块不存在时
```bash
$ pnpm-pilot
```
>会提示：没有找到除了根目录下的其他模块，可使用参数 -s 扫描根目录下的package.json， exp: pnpm-pilot -s

扫描根目录执行即可
```bash
 pnpm-pilot -s

✔ 请选择要调试的模块 uniapp-components - uniapp 组件库
✔ 请选择要调试的脚本 test
开始执行 pnpm test 脚本

> uniapp-components@0.0.0 test E:\Workspace\Project\uniapp-components
> echo "Error: Hello"

"Error: Hello"
```


[npm-version-src]: https://img.shields.io/npm/v/pnpm-monorepo-pilot?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/pnpm-monorepo-pilot
[npm-downloads-src]: https://img.shields.io/npm/dm/pnpm-monorepo-pilot?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/pnpm-monorepo-pilot
