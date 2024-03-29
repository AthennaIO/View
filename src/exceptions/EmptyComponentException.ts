/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class EmptyComponentException extends Exception {
  public constructor(name: string) {
    super({
      status: 500,
      code: 'E_EMPTY_COMPONENT',
      message: `The component ${name} cannot be registered with "null" or "undefined" value.`,
      help: `This exception is thrown when trying to create a component with a "null" or "undefined" value. Try to set at least an empty string when using the "View.createComponent('${name}', '')" method.`
    })
  }
}
