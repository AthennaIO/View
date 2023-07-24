/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Runner, assert, specReporter } from '@athenna/test'

await Runner.setTsEnv()
  .addPlugin(assert())
  .addReporter(specReporter())
  .addPath('tests/unit/**/*.ts')
  .setCliArgs(process.argv.slice(2))
  .setGlobalTimeout(5000)
  .run()
