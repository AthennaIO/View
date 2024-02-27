/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Env, Config } from '@athenna/config'

export default {
  disk: Path.fixtures('views'),

  namedDisks: {
    admin: Path.fixtures('views/admin')
  },

  properties: {
    env: Env,
    config: Config
  },

  components: {
    button: Path.fixtures('views/components/button.edge'),
    copyright: Path.fixtures('views/components/copyright.edge'),
    footer: Path.fixtures('views/components/footer.edge'),
    header: Path.fixtures('views/components/header.edge')
  },

  edge: {
    cache: false
  }
}
