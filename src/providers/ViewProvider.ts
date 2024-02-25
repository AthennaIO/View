/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ViewImpl } from '#src/views/ViewImpl'
import { ServiceProvider } from '@athenna/ioc'

export class ViewProvider extends ServiceProvider {
  public async register() {
    const view = new ViewImpl()
    this.container.instance('Athenna/Core/View', view)
    const disks = Config.get('view.disks', {})

    Object.keys(disks).forEach(k => view.createViewDisk(k, disks[k]))

    const components = Config.get('view.components', {})

    Object.keys(components).forEach(k =>
      view.createComponentByPath(k, components[k])
    )
  }
}
