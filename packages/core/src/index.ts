#! /usr/bin/env node
import { cwd } from 'process'
import { scanPackages } from './scan'
import { program } from 'commander'
import { isNumber, slash } from '@antfu/utils'
import { version } from '../package.json'
import inquirer from 'inquirer'
import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import path, { resolve } from 'path'

const CONFIG_FILE = path.resolve(cwd(), '.scriptrc')
const rootPackageJson = resolve(cwd(), 'package.json')
const rootPnpmWorkspaceYaml = resolve(cwd(), 'pnpm-workspace.yaml')

if (!existsSync(rootPackageJson) ) {
  throw new Error('当前工作目录下没有 package.json 文件')
}
const packageInfo = JSON.parse(readFileSync(resolve(cwd(), 'package.json'), 'utf-8'))

if (!existsSync(rootPnpmWorkspaceYaml) ) {
  throw new Error('当前工作目录下没有 pnpm-workspace.yaml 文件')
}

export {
  scanPackages
}

export function saveHistoryScript(command: string, config: string[] = []) {
  if (config.length == 0 && existsSync(CONFIG_FILE)) {
    config = JSON.parse(readFileSync(CONFIG_FILE, {'encoding': 'utf-8'}) ?? "[]")
  }
  const index = config.findIndex(item => command == item);
  if (index == 0) return
  if (index != -1) {
    config.splice(index, 1)
    config.unshift(command)
  } else {
    config.push(command)
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

async function selectHistoryScript() {
  if (!existsSync(CONFIG_FILE)) return false;
  const config =  JSON.parse(readFileSync(CONFIG_FILE, {'encoding': 'utf-8'}));
  const commands = config.map((command: string) => {
    let match = command.match(/pnpm -F (.*) (.*)/)
    if (match) {
      return {
        name: match[1] + '#' + match[2],
        value: command
      }
    }
    match = command.match(/pnpm ([^-F]*)/)
    if (match) {
      return {
        name: packageInfo.name + '#' + match[1],
        value: command
      }
    }
    return false
  }).filter(Boolean)
  if (commands.length == 0) return false;
  const script = await inquirer.prompt([
    {
      type: 'list',
      name: 'command',
      message: '请选择要调试的脚本',
      choices: commands
    }
  ])
  if (!script) return
  console.log(`开始执行 ${script.command} 脚本`)
  execSync(script.command, { stdio: 'inherit'  })
  saveHistoryScript(script.command, config)
  return true
}

async function main() {

  program
  .option('-s, --scan-root', '是否扫描根目录下的package.json', false)
  .option('-sh, --skip-history', '跳过历史脚本选择', false)
  .option('-si, --skip-interactive [index]', '跳过交互选择界面,直接执行')
  .option('-r, --root [root]', '扫描的目录', slash(cwd()))
  .version(version, '-v, --version', '版本号');

  program.parse()
  const options = program.opts()
  if (options.skipInteractive) {
    options.skipInteractive = /^0|[1-9][0-9]*?$/.test(options.skipInteractive) ? Number(options.skipInteractive) : 0;
    if (!existsSync(CONFIG_FILE)) { 
      console.log('没有找到历史记录,请先执行一次脚本')
      return;
    }
    const config = JSON.parse(readFileSync(CONFIG_FILE, {'encoding': 'utf-8'}) ?? "[]");
    if (options.skipInteractive < config.length && options.skipInteractive >= 0) {
      console.log(`开始执行 ${config[options.skipInteractive]} 脚本`)
      execSync(config[options.skipInteractive], { stdio: 'inherit'  })
      saveHistoryScript(config[options.skipInteractive], config)
    }
    return
  }

  if (!options.skipHistory && await selectHistoryScript()) {
    return
  }

  const modules = scanPackages(options.scanRoot, options.root)
  if (modules.length == 0) {
    console.log('没有找到除了根目录下的其他模块，可使用参数 -s 扫描根目录下的package.json， exp: pnpm-pilot -s')
    return
  }
  const module = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: '请选择要调试的模块',
      choices: modules.map(item => ({
        name: item.name + (item.description ? ' - ' + item.description : '') ,
        value: item.name
      }))
    }
  ])
  if (!module.name) return
  const selectedModule = modules.find(item => item.name === module.name)
  if (!selectedModule || !selectedModule.scripts || selectedModule.scripts.length == 0) return
  const script = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: '请选择要调试的脚本',
      choices: selectedModule.scripts
    }
  ])
  if (!script.name) return
  const command = selectedModule.isRoot ? `pnpm ${script.name}` : `pnpm -F ${selectedModule.name} ${script.name}`;

  console.log(`开始执行 ${command} 脚本`)
  execSync(command, { stdio: 'inherit'  })

  // 读取配置文件
  let config: string[] = [];
  if (existsSync(CONFIG_FILE)) {
    config =  JSON.parse(readFileSync(CONFIG_FILE, {'encoding': 'utf-8'}));
  }
  saveHistoryScript(command, config)
}

main();
