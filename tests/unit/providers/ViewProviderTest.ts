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
import { Test, type Context, AfterEach, BeforeEach, Mock } from '@athenna/test'

export default class ViewProviderTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()
    ioc.reconstruct()
    Config.clear()
  }

  @Test()
  public async shouldBeAbleToRegisterViewImplementationInTheContainer({ assert }: Context) {
    new ViewProvider().register()

    assert.isTrue(ioc.has('Athenna/Core/View'))
  }

  @Test()
  public async shouldBeAbleToUseViewImplementationFromFacade({ assert }: Context) {
    new ViewProvider().register()

    assert.isDefined(View.edge)
  }

  @Test()
  public async shouldRegisterDisksInViewConfigInTheViewInstance({ assert }: Context) {
    await new ViewProvider().register()

    assert.isTrue(View.hasViewDisk('admin'))
  }

  @Test()
  public async shouldRegisterTemplatesInViewConfigInTheViewInstance({ assert }: Context) {
    await new ViewProvider().register()

    assert.isTrue(View.hasComponent('button'))
    assert.isTrue(View.hasComponent('copyright'))
    assert.isTrue(View.hasComponent('footer'))
    assert.isTrue(View.hasComponent('header'))
  }
}
