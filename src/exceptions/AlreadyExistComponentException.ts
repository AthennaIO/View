/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class AlreadyExistComponentException extends Exception {
  public constructor(name: string) {
    super({
      status: 500,
      code: 'E_EXIST_COMPONENT',
      message: `The component ${name} already exists.`,
      help: `This exception is thrown when trying to create a component with a name that is already is use, in this case "${name}". Try to create your component with a different name or remove the other component first using the "View.removeComponent('${name}')" method. Also, "View.createTemplate('${name}', 'your-component-value')" will automatically remove the other component for you.`
    })
  }
}
