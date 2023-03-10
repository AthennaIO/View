/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ioc } from '@athenna/ioc'
import { Config } from '@athenna/config'
import { View, ViewProvider } from '#src'
import { File, Folder, Path } from '@athenna/common'
import { AfterEach, BeforeEach, Test, TestContext } from '@athenna/test'
import { EmptyComponentException } from '#src/Exceptions/EmptyComponentException'
import { NotFoundTemplateException } from '#src/Exceptions/NotFoundTemplateException'
import { AlreadyExistComponentException } from '#src/Exceptions/AlreadyExistComponentException'

export default class ViewTest {
  @BeforeEach()
  public async beforeEach() {
    Config.clear()
    new Ioc().reconstruct()
    await Config.load(Path.stubs('config/rc.ts'))
  }

  @AfterEach()
  public async afterEach() {
    await Folder.safeRemove(Path.resources())
  }

  @Test()
  public async shouldBeAbleToRenderHtmlViewsWithComponentsIncluded({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    const content = await View.render('admin::listUsers', { users: JSON.stringify({ name: 'Victor Tesoura' }) })

    assert.isTrue(content.includes('<title>Hello World!</title>'))
    assert.isTrue(content.includes('&copy; Victor Tesoura txsoura@athenna.io'))
    assert.isTrue(content.includes('List users: {&quot;name&quot;:&quot;Victor Tesoura&quot;}'))
  }

  @Test()
  public async shouldBeAbleToRenderRawEdgeContent({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    const content = '## Hello {{ value }}'
    const data = { value: 'World!' }

    const result = await View.renderRaw(content, data)
    const resultSync = View.renderRawSync(content, data)

    assert.equal(result, '## Hello World!')
    assert.equal(resultSync, '## Hello World!')
  }

  @Test()
  public async shouldBeAbleToAddAndRemoveGlobalPropertiesInViews({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    const content = await View.addProperty('nodeVersion', '18').renderRaw('## Node.js version: {{ nodeVersion }}')
    const contentUndefined = await View.removeProperty('nodeVersion').renderRaw('## Node.js version: {{ nodeVersion }}')

    assert.equal(content, '## Node.js version: 18')
    assert.equal(contentUndefined, '## Node.js version: undefined')
  }

  @Test()
  public async shouldBeAbleToAddAndRemoveGlobalPropertiesInViews({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    const content = await View.addProperty('nodeVersion', '18').renderRaw('## Node.js version: {{ nodeVersion }}')
    const contentUndefined = await View.removeProperty('nodeVersion').renderRaw('## Node.js version: {{ nodeVersion }}')

    assert.equal(content, '## Node.js version: 18')
    assert.equal(contentUndefined, '## Node.js version: undefined')
  }

  @Test()
  public async shouldNotThrowsErrorsWhenTryingToRemoveAGlobalPropertyThatDoesNotExists({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.doesNotThrows(() => View.removeProperty('notFound'))
  }

  @Test()
  public async shouldBeAbleToAddAndRemoveViewDisks({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    View.createViewDisk('test', Path.stubs('views'))

    assert.isTrue(View.hasViewDisk('test'))

    View.removeViewDisk('test')

    assert.isFalse(View.hasViewDisk('test'))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTryingToRenderViewsThatAreNotRegistered({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.throws(() => View.renderSync('notFound'), NotFoundTemplateException)
    await assert.rejects(() => View.render('notFound'), NotFoundTemplateException)
  }

  @Test()
  public async shouldBeAbleToUpdateAlreadyMountedViewDisks({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.isTrue(View.hasViewDisk('admin::listUsers'))

    View.createViewDisk('admin', Path.stubs('views/components'))

    assert.isFalse(View.hasViewDisk('admin::listUsers'))
    assert.isTrue(View.hasViewDisk('admin::header'))
    assert.isTrue(View.hasViewDisk('admin::footer'))
  }

  @Test()
  public async shouldBeAbleToUpdateAlreadyMountedViewDisks({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.isTrue(View.hasViewDisk('admin::listUsers'))

    View.createViewDisk('admin', Path.stubs('views/components'))

    assert.isFalse(View.hasViewDisk('admin::listUsers'))
    assert.isTrue(View.hasViewDisk('admin::header'))
    assert.isTrue(View.hasViewDisk('admin::footer'))
  }

  @Test()
  public async shouldNotThrowsAnyErrorsWhenTryingToRemoveAViewDiskThatDoesNotExists({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.doesNotThrows(() => View.removeViewDisk('notFound'))
  }

  @Test()
  public async shouldBeAbleToCreateAndRemoveComponents({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    View.createComponent('hello', 'Hello')

    assert.isTrue(View.hasComponent('hello'))

    View.removeComponent('hello')

    assert.isFalse(View.hasComponent('hello'))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTryingToCreateAUndefinedComponent({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.throws(() => View.createComponent('testing', undefined), EmptyComponentException)
  }

  @Test()
  public async shouldThrowAnExceptionWhenTryingToCreateAComponentWithANameThatAlreadyExists({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.throws(
      () => View.createComponent('testing', '').createComponent('testing', ''),
      AlreadyExistComponentException,
    )
  }

  @Test()
  public async shouldBeAbleToAutomaticallyRemoveTheComponentIfNameIsAlreadyIsUse({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    View.createTemplate('hello', 'Hello')

    assert.isTrue(View.hasTemplate('hello'))

    View.createTemplate('hello', 'Hello')

    assert.isTrue(View.hasTemplate('hello'))
  }

  @Test()
  public async shouldNotThrowErrorsIfTryingToRemoveAComponentThatDoesNotExists({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.doesNotThrows(() => View.removeComponent('notFound'))
  }

  @Test()
  public async shouldNotThrowErrorsIfTryingToRemoveATemplateThatDoesNotExists({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    new ViewProvider().register()

    assert.doesNotThrows(() => View.removeTemplate('notFound'))
  }

  @Test()
  public async shouldNotRegisterTemplateIfViewTemplatesRegisterIsFalse({ assert }: TestContext) {
    await Config.load(Path.stubs('config/view.ts'))
    Config.set('view.templates.register', false)

    new ViewProvider().register()

    assert.throws(() => View.renderSync('command'), NotFoundTemplateException)
  }

  @Test()
  public async shouldBeAbleToRegisterCustomTemplate({ assert }: TestContext) {
    const templatePath = Path.resources('templates/command.edge')
    await Config.load(Path.stubs('config/view.ts'))
    await new File(templatePath, Buffer.from('Hello')).load()

    new ViewProvider().register()

    assert.equal(View.createTemplateByPath('command', templatePath).renderSync('command'), 'Hello')
  }
}
