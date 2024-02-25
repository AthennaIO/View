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

import { Path } from '@athenna/common'
import { BaseCommand, Argument } from '@athenna/artisan'

export class MakeViewCommand extends BaseCommand {
  @Argument({
    description: 'The view name.'
  })
  public name: string

  public static signature(): string {
    return 'make:view'
  }

  public static description(): string {
    return 'Make a new view file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING VIEW ])\n')

    const destination = Config.get(
      'rc.commands.make:view.destination',
      Path.views()
    )
    const file = await this.generator
      .fileName(this.name)
      .extension('edge')
      .destination(destination)
      .template('view')
      .setNameProperties(true)
      .make()

    this.logger.success(`View ({yellow} "${file.name}") successfully created.`)
  }
}
