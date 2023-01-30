/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Path } from '@athenna/common'
import { Config } from '@athenna/config'
import { View, ViewProvider } from '#src'

test.group('ViewTest', () => {
  test('should be able to render html views with components included', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    const content = await View.render('admin::listUsers', { users: JSON.stringify({ name: 'Victor Tesoura' }) })

    assert.isTrue(content.includes('<title>Hello World!</title>'))
    assert.isTrue(content.includes('List users: {&quot;name&quot;:&quot;Victor Tesoura&quot;}'))
    assert.isTrue(content.includes('&copy; Victor Tesoura txsoura@athenna.io'))
  })

  test('should be able to render artisan templates with components included', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    const content = await View.render('artisan::command', {
      package: 'view',
      author: 'Victor Tesoura',
      email: 'txsoura@athenna.io',
      namePascal: 'MyCommand',
    })

    assert.isTrue(content.includes('@athenna/view'))
    assert.isTrue(content.includes('export class MyCommand {}'))
    assert.isTrue(content.includes('(c) Victor Tesoura <txsoura@athenna.io>'))
  })
})
