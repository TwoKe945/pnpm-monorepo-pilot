# pnpm-monorepo-pilot

> 基于pnpm monorepo的脚本执行工具，可以在根目录通过交互命令，快速执行项目脚本，以及会记录历史使用过的脚本达到快速执行


## 安装

```bash
npm install pnpm-monorepo-pilot -g
```

## 使用

```bash
pnpm-pilot --help # 获取帮助
pnpm-pilot --root [e:/xxx] # 设置项目根目录
pnpm-pilot --skip-history # 跳过历史记录,进行交互选择界面
pnpm-pilot --skip-interactive [index] # 跳过交互选择界面,直接执行
```


