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
    this.container.singleton('Athenna/Core/View', ViewImpl, false)
  }
}
