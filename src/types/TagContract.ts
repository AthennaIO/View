/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { TagContract as EdgeTagContract } from 'edge.js/types'

export type TagContract = Omit<EdgeTagContract, 'tagName'>
