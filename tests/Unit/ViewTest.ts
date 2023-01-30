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

    assert.deepEqual(
      content,
      '<html>\n' +
        '  <head>\n' +
        '    <title>Hello World!</title>\n' +
        '  </head>\n' +
        '\n' +
        '  <body>\n' +
        '    <div>\n' +
        '      List users: {&quot;name&quot;:&quot;Victor Tesoura&quot;}\n' +
        '    </div>\n' +
        '  </body>\n' +
        '  <footer>\n' +
        '    &copy; Victor Tesoura txsoura@athenna.io\n' +
        '  </footer>\n' +
        '</html>',
    )
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

    assert.deepEqual(
      content,
      '/**\n' +
        ' * @@athenna/view\n' +
        ' *\n' +
        ' * (c) Victor Tesoura <txsoura@athenna.io>\n' +
        ' *\n' +
        ' * For the full copyright and license information, please view the LICENSE\n' +
        ' * file that was distributed with this source code.\n' +
        ' */\n' +
        '\n' +
        'export class MyCommand {}',
    )
  })
})
