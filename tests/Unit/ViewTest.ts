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
import { NotFoundTemplateException } from '../../src/Exceptions/NotFoundTemplateException.js'

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

    const content = View.renderSync('artisan::command', {
      package: 'view',
      author: 'Victor Tesoura',
      email: 'txsoura@athenna.io',
      namePascal: 'MyCommand',
    })

    assert.isTrue(content.includes('@athenna/view'))
    assert.isTrue(content.includes('export class MyCommand {}'))
    assert.isTrue(content.includes('(c) Victor Tesoura <txsoura@athenna.io>'))
  })

  test('should be able to render raw edge content', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    const content = '## Hello {{ value }}'
    const data = { value: 'World!' }

    const result = await View.renderRaw(content, data)
    const resultSync = View.renderRawSync(content, data)

    assert.equal(result, '## Hello World!')
    assert.equal(resultSync, '## Hello World!')
  })

  test('should be able to add and remove global properties in views', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    const content = await View.addProperty('nodeVersion', '18').renderRaw('## Node.js version: {{ nodeVersion }}')
    const contentUndefined = await View.removeProperty('nodeVersion').renderRaw('## Node.js version: {{ nodeVersion }}')

    assert.equal(content, '## Node.js version: 18')
    assert.equal(contentUndefined, '## Node.js version: undefined')
  })

  test('should not throws errors when trying to remove a global property that does not exists', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.doesNotThrows(() => View.removeProperty('notFound'))
  })

  test('should be able to add and remove view disks', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    View.createViewDisk('test', Path.stubs('views'))

    assert.isTrue(View.hasViewDisk('test'))

    View.removeViewDisk('test')

    assert.isFalse(View.hasViewDisk('test'))
  })

  test('should throw an exception when trying to render views that are not registered', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.throws(() => View.renderSync('notFound'), NotFoundTemplateException)
    await assert.rejects(() => View.render('notFound'), NotFoundTemplateException)
  })

  test('should be able to update already mounted view disks', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.isTrue(View.hasViewDisk('admin::listUsers'))

    View.createViewDisk('admin', Path.stubs('views/components'))

    assert.isFalse(View.hasViewDisk('admin::listUsers'))
    assert.isTrue(View.hasViewDisk('admin::header'))
    assert.isTrue(View.hasViewDisk('admin::footer'))
  })
})
