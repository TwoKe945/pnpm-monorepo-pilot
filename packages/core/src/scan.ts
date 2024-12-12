import { slash } from '@antfu/utils';
import fg from 'fast-glob'
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
  const exclude = ['node_modules/**']
  if (!scanSelf) {
    exclude.push('package.json')
  }
  const packageJsonAbsolutePaths = fg.sync(['**/package.json'], {
    ignore:exclude,
    cwd: root,
    onlyFiles: false,
    absolute: true,
  })
  const modules: Module[] = []
  packageJsonAbsolutePaths.forEach(packageJsonAbsolutePath => {
    const packageJson = require(packageJsonAbsolutePath)
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
