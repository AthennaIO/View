/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Config } from '@athenna/config'
import { View, ViewProvider } from '#src'
import { USERS } from '#tests/fixtures/constants/Users'
import { Test, AfterEach, BeforeEach, type Context } from '@athenna/test'
import { EmptyComponentException } from '#src/exceptions/EmptyComponentException'
import { NotFoundComponentException } from '#src/exceptions/NotFoundComponentException'
import { AlreadyExistComponentException } from '#src/exceptions/AlreadyExistComponentException'

export default class ViewImplTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
    new ViewProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    Config.clear()
    ioc.reconstruct()
  }

  @Test()
  public async shouldBeAbleToRenderDisks({ assert }: Context) {
    const content = await View.render('admin::listUsers', { users: USERS })

    assert.isTrue(content.includes('<title>Hello World!</title>'))
    assert.isTrue(content.includes('&copy; Victor Tesoura txsoura@athenna.io'))
    USERS.forEach(USER => {
      assert.isTrue(content.includes(`<li>${USER.id}</li>`))
      assert.isTrue(content.includes(`<li>${USER.name}</li>`))
      assert.isTrue(content.includes(`<li>${USER.email}</li>`))
    })
  }

  @Test()
  public async shouldBeAbleToRenderComponents({ assert }: Context) {
    const content = await View.render('copyright', {
      package: 'view',
      author: 'lenon',
      email: 'lenon@athenna.io'
    })

    assert.isTrue(content.includes(' * @athenna/view'))
    assert.isTrue(content.includes(' * (c) lenon <lenon@athenna.io>'))
  }

  @Test()
  public async shouldThrowNotFoundComponentExceptionIfTryingToRenderADiskThatDoesNotExist({ assert }: Context) {
    await assert.rejects(() => View.render('notfound::disk'), NotFoundComponentException)
  }

  @Test()
  public async shouldThrowNotFoundComponentExceptionIfTryingToRenderAComponentThatDoesNotExist({ assert }: Context) {
    await assert.rejects(() => View.render('notfound'), NotFoundComponentException)
  }

  @Test()
  public async shouldBeAbleToRenderDisksUsingRenderSync({ assert }: Context) {
    const content = View.renderSync('admin::listUsers', { users: USERS })

    assert.isTrue(content.includes('<title>Hello World!</title>'))
    assert.isTrue(content.includes('&copy; Victor Tesoura txsoura@athenna.io'))
    USERS.forEach(USER => {
      assert.isTrue(content.includes(`<li>${USER.id}</li>`))
      assert.isTrue(content.includes(`<li>${USER.name}</li>`))
      assert.isTrue(content.includes(`<li>${USER.email}</li>`))
    })
  }

  @Test()
  public async shouldBeAbleToRenderComponentsUsingRenderSync({ assert }: Context) {
    const content = View.renderSync('copyright', {
      package: 'view',
      author: 'lenon',
      email: 'lenon@athenna.io'
    })

    assert.isTrue(content.includes(' * @athenna/view'))
    assert.isTrue(content.includes(' * (c) lenon <lenon@athenna.io>'))
  }

  @Test()
  public async shouldThrowNotFoundComponentExceptionIfTryingToRenderADiskThatDoesNotExistUsingRenderSync({
    assert
  }: Context) {
    assert.throws(() => View.renderSync('notfound::disk'), NotFoundComponentException)
  }

  @Test()
  public async shouldThrowNotFoundComponentExceptionIfTryingToRenderAComponentThatDoesNotExistUsingRenderSyn({
    assert
  }: Context) {
    assert.throws(() => View.renderSync('notfound'), NotFoundComponentException)
  }

  @Test()
  public async shouldBeAbleToRenderRawValues({ assert }: Context) {
    const content = await View.renderRaw('<h1>{{ name }}</h1>', { name: 'lenon' })

    assert.deepEqual(content, '<h1>lenon</h1>')
  }

  @Test()
  public async shouldBeAbleToRenderRawValuesUsingRenderRawSync({ assert }: Context) {
    const content = View.renderRawSync('<h1>{{ name }}</h1>', { name: 'lenon' })

    assert.deepEqual(content, '<h1>lenon</h1>')
  }

  @Test()
  public async shouldBeAbleToRenderRawFileContentByPath({ assert }: Context) {
    const content = await View.renderRawByPath(Path.fixtures('views/components/copyright.edge'), {
      package: 'view',
      author: 'lenon',
      email: 'lenon'
    })

    assert.isTrue(content.includes('@athenna/view'))
    assert.isTrue(content.includes('lenon <lenon>'))
  }

  @Test()
  public async shouldBeAbleToRenderRawFileContentByPathUsingRenderRawByPathSync({ assert }: Context) {
    const content = View.renderRawByPathSync(Path.fixtures('views/components/copyright.edge'), {
      package: 'view',
      author: 'lenon',
      email: 'lenon'
    })

    assert.isTrue(content.includes('@athenna/view'))
    assert.isTrue(content.includes('lenon <lenon>'))
  }

  @Test()
  public async shouldBeAbleToAddGlobalPropertiesToBeUsedByAllViews({ assert }: Context) {
    View.addProperty('package', '@athenna/view')
    View.addProperty('module', () => 'providers/ViewProvider')

    const content = await View.renderRaw('<h1>{{ package }}/{{ module() }}</h1>')

    assert.deepEqual(content, '<h1>@athenna/view/providers/ViewProvider</h1>')
  }

  @Test()
  public async shouldBeAbleToRemoveGlobalProperties({ assert }: Context) {
    View.addProperty('package', '@athenna/view')
    View.addProperty('module', () => 'providers/ViewProvider')

    {
      const content = await View.renderRaw('<h1>{{ package }}/{{ module() }}</h1>')

      assert.deepEqual(content, '<h1>@athenna/view/providers/ViewProvider</h1>')
    }

    View.removeProperty('package')
    View.removeProperty('module')

    {
      const content = await View.renderRaw('<h1>{{ package }}/{{ module }}</h1>')

      assert.deepEqual(content, '<h1>undefined/undefined</h1>')
    }
  }

  @Test()
  public async shouldBeAbleToRemoveGlobalPropertiesThatDoesNotExist({ assert }: Context) {
    View.addProperty('package', '@athenna/view')
    View.addProperty('module', () => 'providers/ViewProvider')

    {
      const content = await View.renderRaw('<h1>{{ package }}/{{ module() }}</h1>')

      assert.deepEqual(content, '<h1>@athenna/view/providers/ViewProvider</h1>')
    }

    View.removeProperty('package')
    View.removeProperty('module')
    View.removeProperty('not-found')

    {
      const content = await View.renderRaw('<h1>{{ package }}/{{ module }}</h1>')

      assert.deepEqual(content, '<h1>undefined/undefined</h1>')
    }
  }

  @Test()
  public async shouldBeAbleToCreateViewDisks({ assert }: Context) {
    View.createViewDisk('test', Path.fixtures('views/admin'))

    const content = await View.render('test::listUsers', { users: USERS })

    assert.isTrue(content.includes('<title>Hello World!</title>'))
  }

  @Test()
  public async shouldBeAbleToCreateViewDisksByRelativePath({ assert }: Context) {
    View.createViewDisk('test', 'tests/fixtures/views/admin')

    const content = await View.render('test::listUsers', { users: USERS })

    assert.isTrue(content.includes('<title>Hello World!</title>'))
  }

  @Test()
  public async shouldBeAbleToCreateDefaultViewDisks({ assert }: Context) {
    View.createViewDisk(Path.fixtures('views'))

    const content = await View.render('admin/listUsers', { users: USERS })

    assert.isTrue(content.includes('<title>Hello World!</title>'))
  }

  @Test()
  public async shouldBeAbleToCreateDefaultViewDisksByRelativePath({ assert }: Context) {
    View.createViewDisk('tests/fixtures/views/admin')

    const content = await View.render('listUsers', { users: USERS })

    assert.isTrue(content.includes('<title>Hello World!</title>'))
  }

  @Test()
  public async shouldBeAbleToRemoveViewDisks({ assert }: Context) {
    View.createViewDisk('test', Path.fixtures('views/admin'))

    const content = await View.render('test::listUsers', { users: USERS })

    assert.isTrue(content.includes('<title>Hello World!</title>'))

    View.removeViewDisk('test')

    await assert.rejects(() => View.render('test::listUsers'), NotFoundComponentException)
  }

  @Test()
  public async shouldBeAbleToRemoveViewDiskThatDoesNotExist({ assert }: Context) {
    View.createViewDisk('test', Path.fixtures('views/admin'))

    View.removeViewDisk('not-found')
    View.removeViewDisk('test')

    await assert.rejects(() => View.render('test::listUsers'), NotFoundComponentException)
  }

  @Test()
  public async shouldBeAbleToValidateThatViewDisksExists({ assert }: Context) {
    View.createViewDisk('test', Path.fixtures('views/admin'))

    assert.isTrue(View.hasViewDisk('test'))

    View.removeViewDisk('test')

    assert.isFalse(View.hasViewDisk('test'))
  }

  @Test()
  public async shouldBeAbleToCreateAComponent({ assert }: Context) {
    View.createComponent('ui.button', '<button>{{ content }}</button>')

    assert.deepEqual(View.renderSync('ui.button', { content: 'Login' }), '<button>Login</button>')
  }

  @Test()
  public async shouldThrowEmptyComponentExceptionIfTryingToCreateWithTheSameName({ assert }: Context) {
    assert.throws(() => View.createComponent('button', undefined), EmptyComponentException)
  }

  @Test()
  public async shouldBeAbleToCreateAComponentByFilePath({ assert }: Context) {
    View.createComponentByPath('ui.copyright', Path.fixtures('views/components/copyright.edge'))

    const content = await View.render('ui.copyright', {
      package: 'view',
      author: 'lenon',
      email: 'lenon'
    })

    assert.isTrue(content.includes('@athenna/view'))
    assert.isTrue(content.includes('lenon <lenon>'))
  }

  @Test()
  public async shouldThrowAlreadyExistComponentExceptionIfTryingToCreateWithTheSameName({ assert }: Context) {
    assert.throws(() => View.createComponent('button', ''), AlreadyExistComponentException)
  }

  @Test()
  public async shouldBeAbleToRemoveAComponent({ assert }: Context) {
    View.createComponent('ui.button', '<button>{{ content }}</button>')

    assert.deepEqual(View.renderSync('ui.button', { content: 'Login' }), '<button>Login</button>')

    View.removeComponent('ui.button')

    assert.throws(() => View.renderSync('ui.button'), NotFoundComponentException)
  }

  @Test()
  public async shouldBeAbleToRemoveAComponentThatDoesNotExist({ assert }: Context) {
    View.createComponent('ui.button', '<button>{{ content }}</button>')

    View.removeComponent('not-found')
    View.removeComponent('ui.button')

    assert.throws(() => View.renderSync('ui.button'), NotFoundComponentException)
  }

  @Test()
  public async shouldBeAbleToValidateThatComponentExists({ assert }: Context) {
    View.createComponent('ui.button', '<button>{{ content }}<button>')

    assert.isTrue(View.hasComponent('ui.button'))

    View.removeComponent('ui.button')

    assert.isFalse(View.hasComponent('ui.button'))
  }

  @Test()
  public async shouldBeAbleToCreateATemplate({ assert }: Context) {
    View.createTemplate('ui.button', '<button>{{ content }}</button>')

    assert.deepEqual(View.renderSync('ui.button', { content: 'Login' }), '<button>Login</button>')
  }

  @Test()
  public async shouldThrowEmptyTemplateExceptionIfTryingToCreateWithTheSameName({ assert }: Context) {
    assert.throws(() => View.createTemplate('button', undefined), EmptyComponentException)
  }

  @Test()
  public async shouldBeAbleToCreateATemplateByFilePath({ assert }: Context) {
    View.createTemplateByPath('ui.copyright', Path.fixtures('views/components/copyright.edge'))

    const content = await View.render('ui.copyright', {
      package: 'view',
      author: 'lenon',
      email: 'lenon'
    })

    assert.isTrue(content.includes('@athenna/view'))
    assert.isTrue(content.includes('lenon <lenon>'))
  }

  @Test()
  public async shouldNotThrowErrorsWhenCreatingATemplateByFilePathThatDoesNotExist({ assert }: Context) {
    assert.doesNotThrow(() => View.createTemplateByPath('not-found', Path.fixtures('not-found.edge')))
  }

  @Test()
  public async shouldNotThrowAlreadyExistTemplateExceptionIfTryingToCreateWithTheSameName({ assert }: Context) {
    assert.doesNotThrow(() => View.createTemplate('button', ''), AlreadyExistComponentException)
  }

  @Test()
  public async shouldBeAbleToRemoveATemplate({ assert }: Context) {
    View.createTemplate('ui.button', '<button>{{ content }}</button>')

    assert.deepEqual(View.renderSync('ui.button', { content: 'Login' }), '<button>Login</button>')

    View.removeTemplate('ui.button')

    assert.throws(() => View.renderSync('ui.button'), NotFoundComponentException)
  }

  @Test()
  public async shouldBeAbleToRemoveATemplateThatDoesNotExist({ assert }: Context) {
    View.createTemplate('ui.button', '<button>{{ content }}</button>')

    View.removeTemplate('not-found')
    View.removeTemplate('ui.button')

    assert.throws(() => View.renderSync('ui.button'), NotFoundComponentException)
  }

  @Test()
  public async shouldBeAbleToValidateThatTemplateExists({ assert }: Context) {
    View.createTemplate('ui.button', '<button>{{ content }}<button>')

    assert.isTrue(View.hasTemplate('ui.button'))

    View.removeTemplate('ui.button')

    assert.isFalse(View.hasComponent('ui.button'))
  }
}
