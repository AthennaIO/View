/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ioc } from '@athenna/ioc'
import { test } from '@japa/runner'
import { File, Folder, Path } from '@athenna/common'
import { Config } from '@athenna/config'
import { View, ViewProvider } from '#src'
import { EmptyComponentException } from '#src/Exceptions/EmptyComponentException'
import { NotFoundTemplateException } from '#src/Exceptions/NotFoundTemplateException'
import { AlreadyExistComponentException } from '#src/Exceptions/AlreadyExistComponentException'

test.group('ViewTest', group => {
  group.each.setup(async () => {
    Config.clear()
    new Ioc().reconstruct()
  })

  group.each.teardown(async () => {
    await Folder.safeRemove(Path.resources())
  })

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

  test('should not throw any errors when trying to remove a disk that does not exist', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.doesNotThrows(() => View.removeViewDisk('notFound'))
  })

  test('should be able to create and remove components', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    View.createComponent('hello', 'Hello')

    assert.isTrue(View.hasComponent('hello'))

    View.removeComponent('hello')

    assert.isFalse(View.hasComponent('hello'))
  })

  test('should throw an exception when trying to create a undefined component', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.throws(() => View.createComponent('testing', undefined), EmptyComponentException)
  })

  test('should throw an exception when trying to create a component with a name that already exists', async ({
    assert,
  }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.throws(
      () => View.createComponent('testing', '').createComponent('testing', ''),
      AlreadyExistComponentException,
    )
  })

  test('should be able to automatically remove the template if name is already is use', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    View.createTemplate('hello', 'Hello')

    assert.isTrue(View.hasTemplate('hello'))

    View.createTemplate('hello', 'Hello')

    assert.isTrue(View.hasTemplate('hello'))
  })

  test('should not throw errors if trying to create a template by path that does not exists', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.doesNotThrows(() => View.createTemplateByPath('notFound', 'notFound.edge'))
  })

  test('should not throw errors if trying to remove a template that does not exist', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.doesNotThrows(() => View.removeTemplate('notFound'))
  })

  test('should not register template if view.templates.register is false', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))

    Config.set('view.templates.register', false)

    new ViewProvider().register()

    assert.throws(() => View.renderSync('command'), NotFoundTemplateException)
  })

  test('should be able to register custom templates in "resources/templates" folder', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))
    await new File(Path.resources('templates/command.edge'), Buffer.from('Hello')).load()

    new ViewProvider().register()

    assert.equal(View.renderSync('artisan::command'), 'Hello')
  })

  test('should not register custom templates if folder does not exists', async ({ assert }) => {
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

  test('should not use custom templates if view.templates.useCustom is false', async ({ assert }) => {
    await Config.load(Path.stubs('config/view.ts'))

    Config.set('view.templates.useCustom', false)

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
})
