/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ViewImpl } from '#src/Views/ViewImpl'
import { ServiceProvider } from '@athenna/ioc'

export class ViewProvider extends ServiceProvider {
  public register() {
    const view = new ViewImpl()
    const disks = Config.get('rc.view.disks', {})

    Object.keys(disks).forEach(k => view.createViewDisk(k, disks[k]))

    this.container.instance('Athenna/Core/View', view, false)
  }
}
