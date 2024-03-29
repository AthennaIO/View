/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Facade } from '@athenna/ioc'
import { ViewImpl } from '#src/views/ViewImpl'

export const View = Facade.createFor<ViewImpl>('Athenna/Core/View')
