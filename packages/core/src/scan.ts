import { slash } from '@antfu/utils';
import fg from 'fast-glob'
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { cwd } from 'process';

export interface Module {
  name: string
  isRoot: boolean
  description: string
  scripts: string[]
}

/**
 * 扫描package.json
 * @param root
 */
export function scanPackages(scanSelf: boolean = false,root: string = cwd()) {
  const exclude = []
  if (!scanSelf) {
    exclude.push('package.json')
  }
  const packageJsonAbsolutePaths = fg.sync(['**/package.json', '!**/node_modules/**'], {
    ignore: exclude,
    cwd: root,
    onlyFiles: false,
    absolute: true,
  })
  const modules: Module[] = []
  packageJsonAbsolutePaths.forEach(packageJsonAbsolutePath => {
    const packageJson = JSON.parse(readFileSync(packageJsonAbsolutePath, 'utf-8'))
    const scripts = Object.keys(packageJson.scripts || {})
    modules.push({
      name: packageJson.name,
      isRoot: slash(resolve(root, 'package.json')) == slash(packageJsonAbsolutePath),
      description: packageJson.description || '',
      scripts
    })
  })
  return modules
}
