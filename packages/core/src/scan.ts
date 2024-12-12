import fg from 'fast-glob'
import { cwd } from 'process';

export interface Module {
  name: string
  description: string
  scripts: string[]
}

/**
 * 扫描package.json
 * @param root
 */
export function scanPackages(scanSelf: boolean = false,root: string = cwd()) {
  const packageJsonAbsolutePaths = fg.sync(['**/package.json'], {
    ignore:['node_modules/**'],
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
      description: packageJson.description || '',
      scripts
    })
  })
  return modules
}
