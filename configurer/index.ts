/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { File, Path } from '@athenna/common'
import { BaseConfigurer } from '@athenna/artisan'

export default class ViewConfigurer extends BaseConfigurer {
  public async configure() {
    const ext = Path.ext()
    const task = this.logger.task()

    task.addPromise(`Create view.${ext} configuration file`, () => {
      return new File(`./view`).copy(Path.config(`view.${ext}`))
    })

    task.addPromise('Update commands of .athennarc.json', () => {
      return this.rc
        .setTo(
          'commands',
          'make:view',
          '@athenna/view/commands/MakeViewCommand'
        )
        .save()
    })

    task.addPromise('Update templates of .athennarc.json', () => {
      return this.rc
        .setTo(
          'templates',
          'view',
          'node_modules/@athenna/view/templates/view.edge'
        )
        .save()
    })

    task.addPromise('Update providers of .athennarc.json', () => {
      return this.rc
        .pushTo('providers', '@athenna/view/providers/ViewProvider')
        .save()
    })

    await task.run()

    console.log()
    this.logger.success(
      'Successfully configured ({dim,yellow} @athenna/view) library'
    )
  }
}
