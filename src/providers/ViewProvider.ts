/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Env, Config } from '@athenna/config'
import { ViewImpl } from '#src/views/ViewImpl'
import { ServiceProvider } from '@athenna/ioc'

export class ViewProvider extends ServiceProvider {
  public register() {
    const view = new ViewImpl()

    view.addProperty('Env', Env)
    view.addProperty('Config', Config)

    this.container.instance('Athenna/Core/View', view)

    if (Config.exists('view.disk')) {
      view.createViewDisk(Config.get('view.disk'))
    }

    const disks = Config.get('view.namedDisks', {})

    Object.keys(disks).forEach(k => view.createViewDisk(k, disks[k]))

    const components = Config.get('view.components', {})

    Object.keys(components).forEach(k =>
      view.createComponentByPath(k, components[k])
    )
  }
}
