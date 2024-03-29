/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotFoundComponentException extends Exception {
  public constructor(name: string) {
    super({
      status: 500,
      code: 'E_NOT_FOUND',
      message: `The view or component ${name} cannot be found.`,
      help: `This exception is thrown when trying to render a view or a component that has not been registered. Try to create your component or your disk using the "View.createComponent('${name}', 'your-template-content')", or "View.createViewDisk('${name}', 'your-view-disk-path')" methods.`
    })
  }
}
