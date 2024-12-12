#! /usr/bin/env node
import { cwd } from 'process'
import { scanPackages } from './scan'
import { program } from 'commander'
import { slash } from '@antfu/utils'
import { version } from '../package.json'
import inquirer from 'inquirer'
import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

const CONFIG_FILE = path.resolve(cwd(), '.scriptrc')

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
    const match = command.match(/pnpm -F (.*) (.*)/)
    if (match) {
      return {
        name: match[1] + '#' + match[2],
        value: command
      }
    } else {
      return false
    }
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
  execSync(script.command)
  saveHistoryScript(script.command, config)
  return true
}

async function main() {

  program
  .option('-s, --scan-root', '是否扫描根目录下的package.json', false)
  .option('-sh, --skip-history', '跳过历史脚本选择', false)
  .option('-r, --root [root]', '扫描的目录', slash(cwd()))
  .version(version, '-v, --version', '版本号');

  program.parse()
  const options = program.opts()

  if (!options.skipHistory && await selectHistoryScript()) {
    return
  }

  const modules = scanPackages(options.scanRoot, options.root)
  console.log(options.scanRoot, options.root)
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
  console.log(`开始执行 ${selectedModule.name} 的 ${script.name} 脚本`)

  const command =  `pnpm -F ${selectedModule.name} ${script.name}`;
  execSync(command)

  // 读取配置文件
  let config: string[] = [];
  if (existsSync(CONFIG_FILE)) {
    config =  JSON.parse(readFileSync(CONFIG_FILE, {'encoding': 'utf-8'}));
  }
  saveHistoryScript(command, config)
}

main();
