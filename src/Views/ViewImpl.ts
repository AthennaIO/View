/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Edge } from 'edge.js'
import { Config } from '@athenna/config'
import { File, Is } from '@athenna/common'
import { EmptyComponentException } from '#src/Exceptions/EmptyComponentException'
import { NotFoundTemplateException } from '#src/Exceptions/NotFoundTemplateException'
import { AlreadyExistComponentException } from '#src/Exceptions/AlreadyExistComponentException'

export class ViewImpl {
  /**
   * Edge instance that is handling all the views.
   */
  public edge: Edge

  public constructor() {
    this.edge = new Edge(Config.get('rc.view.edge', {}))
  }

  /**
   * Render some view with optional data included.
   *
   * @example
   * ```ts
   * View.render('welcome', { greeting: 'Hello world' })
   * ```
   */
  public async render(template: string, data?: any): Promise<string> {
    if (!this.isMountedOrIsTemplate(template)) {
      throw new NotFoundTemplateException(template)
    }

    return this.edge.render(template, data)
  }

  /**
   * Render some view asynchronously with optional data included.
   *
   * @example
   * ```ts
   * View.renderSync('welcome', { greeting: 'Hello world' })
   * ```
   */
  public renderSync(template: string, data?: any): string {
    if (!this.isMountedOrIsTemplate(template)) {
      throw new NotFoundTemplateException(template)
    }

    return this.edge.renderSync(template, data)
  }

  /**
   * Render some raw edge content with optional data included.
   *
   * @example
   * ```ts
   * View.renderRaw('Hello {{ value }}', { value: 'World!' })
   * ```
   */
  public async renderRaw(content: string, data?: any): Promise<string> {
    return this.edge.renderRaw(content, data)
  }

  /**
   * Render some raw edge content asynchronously with optional
   * data included.
   *
   * @example
   * ```ts
   * View.renderRawSync('Hello {{ value }}', { value: 'World!' })
   * ```
   */
  public renderRawSync(content: string, data?: any): string {
    return this.edge.renderRawSync(content, data)
  }

  /**
   * Add a new property to templates. The properties registered
   * here will be available to all the templates. You can use
   * this method to update properties too.
   *
   * @example
   * ```ts
   * View
   *  .addProperty('usernameOne', 'txsoura')
   *  .addProperty('usernameTwo', 'jlenon7')
   *  .addProperty('time', () => new Date().getTime())
   * ```
   */
  public addProperty(key: string, value: any): ViewImpl {
    this.edge.global(key, value)

    return this
  }

  /**
   * Remove some property from views registered using
   * "addProperty" method.
   *
   * @example
   * ```ts
   * View
   *  .addProperty('testing', '')
   *  .removeProperty('testing')
   * ```
   */
  public removeProperty(key: string): ViewImpl {
    if (!this.edge.GLOBALS[key]) {
      return this
    }

    delete this.edge.GLOBALS[key]

    return this
  }

  /**
   * Create a new view disk. View disks can be used
   * to register multiple views at the same time.
   *
   * Imagine these three paths:
   *
   * resources/views/admin/listUsers.edge\
   * resources/views/admin/createUser.edge\
   * resources/views/admin/details/listUserDetails.edge
   *
   * @example
   * ```ts
   * View.createViewDisk('admin', Path.views('admin'))
   *
   * const users = [...]
   *
   * View.render('admin::listUsers', { users })
   * View.render('admin::createUser')
   * View.render('admin::details/listUserDetails', { users })
   * ```
   */
  public createViewDisk(name: string, path: string): ViewImpl {
    if (this.hasViewDisk(name)) {
      this.removeViewDisk(name)
    }

    this.edge.mount(name, path)

    return this
  }

  /**
   * Delete a view disk that was registered using
   * the "createViewDisk" method.
   *
   * @example
   * ```ts
   * View
   *  .createViewDisk('admin', Path.views('admin'))
   *  .removeViewDisk('admin')
   * ```
   */
  public removeViewDisk(name: string): ViewImpl {
    if (!this.hasViewDisk(name)) {
      return this
    }

    this.edge.unmount(name)

    return this
  }

  /**
   * Verify if some view disk exists.
   *
   * @example
   *  View.createViewDisk('testing', Path.views('testing'))
   *
   *  View.hasViewDisk('testing') // true
   *  View.hasViewDisk('testing::subTesting') // true
   *  View.hasViewDisk('testing::subTesting/notFound') // false
   */
  public hasViewDisk(name: string): boolean {
    try {
      const path = this.edge.loader.makePath(name)
      this.edge.loader.resolve(path)

      return true
    } catch (err) {
      const has = this.edge.loader.mounted[name]

      if (has) {
        return true
      }

      return false
    }
  }

  /**
   * Create a in-memory component.
   *
   * @example
   * ```ts
   * View.createComponent('button', '<button class="{{ this.type }}">@!yield($slots.main())</button>')
   * ```
   *
   * In-memory components could be used this
   * way (Ignore the "\\" value in the example):
   *
   * @example
   * ```edge
   * \@component('button', type = 'primary')
   *   Get started
   * \@endcomponent
   * ```
   */
  public createComponent(name: string, component: string): ViewImpl {
    if (!Is.Defined(component)) {
      throw new EmptyComponentException(name)
    }

    if (this.hasComponent(name)) {
      throw new AlreadyExistComponentException(name)
    }

    this.edge.registerTemplate(name, { template: component })

    return this
  }

  /**
   * Verify if some component exists.
   *
   * @example
   *  View
   *    .createComponent('testing', '')
   *    .hasComponent('testing') // true
   */
  public hasComponent(name: string): boolean {
    return !!this.edge.loader.templates[name]
  }

  /**
   * Delete the component created using the "createComponent"
   * method.
   *
   * @example
   *  View
   *    .createComponent('testing', '')
   *    .removeComponent('testing')
   */
  public removeComponent(name: string): ViewImpl {
    this.edge.removeTemplate(name)

    return this
  }

  /**
   * Create a in-memory template. If the template name already exists, it
   * will be replaced.
   *
   * @example
   * ```ts
   * View.createTemplate('artisan::command', 'export class {{ namePascal }}')
   *
   * View.render('artisan::command', { namePascal: 'MyCommand' })
   * ```
   *
   * In-memory template could be used as components also
   * (Ignore the "\\" value in the example):
   *
   * @example
   * ```edge
   * \@component('artisan::command')
   *   Hello
   * \@endcomponent
   * ```
   */
  public createTemplate(name: string, template: string): ViewImpl {
    if (this.hasTemplate(name)) {
      this.removeTemplate(name)
    }

    return this.createComponent(name, template)
  }

  /**
   * Same as "createTemplate" method but create the template by the path
   * instead. If the file path does not exist, the registration is ignored
   * (no errors).
   *
   * @example
   * ```ts
   * const path = Path.resources('views/myTemplate.edge')
   *
   * View.createTemplateByPath('myTemplate', path)
   * ```
   */
  public createTemplateByPath(name: string, templatePath: string): ViewImpl {
    const file = new File(templatePath, Buffer.from(''))

    if (!file.fileExists) {
      return this
    }

    return this.createTemplate(name, file.getContentSync().toString())
  }

  /**
   * Verify if some template exists.
   *
   * @example
   *  View
   *    .createTemplate('testing', '')
   *    .hasTemplate('testing') // true
   */
  public hasTemplate(name: string): boolean {
    return this.hasComponent(name)
  }

  /**
   * Delete the template created using the "createTemplate"
   * method.
   *
   * @example
   *  View
   *    .createTemplate('testing', '')
   *    .removeTemplate('testing')
   */
  public removeTemplate(name: string): ViewImpl {
    if (!this.hasTemplate(name)) {
      return this
    }

    return this.removeComponent(name)
  }

  /**
   * Verify if Edge has the template name loaded or mounted.
   */
  private isMountedOrIsTemplate(template: string): boolean {
    return this.hasViewDisk(template) || this.hasTemplate(template)
  }
}
