/**
 * @athenna/view
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Edge } from 'edge.js'
import { debug } from '#src/debug'
import { Config } from '@athenna/config'
import { resolve, isAbsolute } from 'node:path'
import type { TagContract } from '#src/types/TagContract'
import { Is, File, Path, Macroable } from '@athenna/common'
import { EmptyComponentException } from '#src/exceptions/EmptyComponentException'
import { NotFoundComponentException } from '#src/exceptions/NotFoundComponentException'
import { AlreadyExistComponentException } from '#src/exceptions/AlreadyExistComponentException'

export class ViewImpl extends Macroable {
  /**
   * Edge instance that is handling all the views.
   */
  public edge: Edge

  public constructor() {
    super()
    this.edge = Edge.create(Config.get('view.edge', {}))
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
      throw new NotFoundComponentException(template)
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
      throw new NotFoundComponentException(template)
    }

    return this.edge.renderSync(template, data)
  }

  /**
   * Render some raw-edge content with optional data included.
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
   * Render some raw-edge content asynchronously with optional
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
   * Render some raw-edge file content with optional data included.
   *
   * @example
   * ```ts
   * View.renderRawByPath(Path.views('hello.edge'), { value: 'World!' })
   * ```
   */
  public async renderRawByPath(path: string, data?: any): Promise<string> {
    return new File(path)
      .getContentAsString()
      .then(content => this.edge.renderRaw(content, data))
  }

  /**
   * Render some raw-edge file content asynchronously with optional
   * data included.
   *
   * @example
   * ```ts
   * View.renderRawByPathSync(Path.views('hello.edge'), { value: 'World!' })
   * ```
   */
  public renderRawByPathSync(path: string, data?: any): string {
    const content = new File(path).getContentAsStringSync()

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
    if (!this.edge.globals[key]) {
      return this
    }

    delete this.edge.globals[key]

    return this
  }

  /**
   * Add a new tag to templates. Just like @component
   * @if, etc.
   *
   * @example
   * ```ts
   * import type { TagContract } from '@athenna/view'
   *
   * const reverseTagOptions: TagContract = {
   *   block: false,
   *   seekable: true,
   *   compile(parser, buffer, token) {
   *     buffer.outputRaw('Hello from reverse tag')
   *   }
   * }
   *
   * View.addTag('reverse', reverseTagOptions)
   *
   * const output = await View.renderRaw('@reverse()') // 'Hello from reverse tag'
   * ```
   */
  public addTag(name: string, options: TagContract) {
    this.edge.registerTag({ tagName: name, ...options })

    return this
  }

  /**
   * Remove some tag from views registered using
   * "addTag" method.
   *
   * @example
   * ```ts
   * View
   *  .addTag('reverse', { ... })
   *  .removeTag('reverse')
   * ```
   */
  public removeTag(name: string) {
    if (!this.edge.tags[name]) {
      return this
    }

    delete this.edge.tags[name]

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
   * View.createViewDisk(Path.views())
   * View.createViewDisk('admin', Path.views('admin'))
   *
   * const users = [...]
   *
   * View.render('admin/listUsers', { users })
   * View.render('admin::listUsers', { users })
   *
   * View.render('admin/createUser')
   * View.render('admin::createUser')
   *
   * View.render('admin/details/listUserDetails', { users })
   * View.render('admin::details/listUserDetails', { users })
   * ```
   */
  public createViewDisk(name: string, path?: string): ViewImpl {
    if (!path) {
      debug('Creating view disk for path %s.', name)

      if (!isAbsolute(name)) {
        debug(
          'Path %s is not absolute and is going to be resolved using cwd %s.',
          name,
          Path.pwd()
        )

        name = resolve(Path.pwd(), name)
      }

      this.edge.mount(name)

      return this
    }

    debug('Creating view disk %s for path %s.', name, path)

    if (!isAbsolute(path)) {
      debug(
        'Path %s for view disk %s is not absolute and is going to be resolved using cwd %s.',
        path,
        name,
        Path.pwd()
      )

      path = resolve(Path.pwd(), path)
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
      debug('View disk %s does not exist, skipping removing operation.', name)

      return this
    }

    debug('Removing view disk %s.', name)

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
    } catch (_err) {
      const has = this.edge.loader.mounted[name]

      return !!has
    }
  }

  /**
   * Create an in-memory component.
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

    debug('Registering component %s.', name)

    this.edge.registerTemplate(name, { template: component })

    return this
  }

  /**
   * Same as "createComponent" method but create the template by the path
   * instead. If the file path does not exist, an error will throw.
   *
   * @example
   * ```ts
   * const path = Path.resources('views/myTemplate.edge')
   *
   * View.createComponentByPath('myTemplate', path)
   * ```
   */
  public createComponentByPath(name: string, path: string): ViewImpl {
    if (!isAbsolute(path)) {
      debug(
        'Path %s for view disk is not absolute and is going to be resolved using cwd %s.',
        path,
        Path.pwd()
      )

      path = resolve(Path.pwd(), path)
    }

    const file = new File(path)

    return this.createTemplate(name, file.getContentAsStringSync())
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
    debug('Removing component %s.', name)

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
      debug('Template %s already exists and will be removed first.', name)

      this.removeTemplate(name)
    }

    debug('Creating template %s.', name)

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
  public createTemplateByPath(name: string, path: string): ViewImpl {
    if (!isAbsolute(path)) {
      debug(
        'Path %s for view disk is not absolute and is going to be resolved using cwd %s.',
        path,
        Path.pwd()
      )

      path = resolve(Path.pwd(), path)
    }

    const file = new File(path, Buffer.from(''))

    if (!file.fileExists) {
      return this
    }

    return this.createTemplate(name, file.getContentAsStringSync())
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
      debug(
        'Template %s does not exist and removing operation will be skipped.',
        name
      )

      return this
    }

    debug('Removing template %s.', name)

    return this.removeComponent(name)
  }

  /**
   * Verify if Edge has the template name loaded or mounted.
   */
  private isMountedOrIsTemplate(template: string): boolean {
    return this.hasViewDisk(template) || this.hasTemplate(template)
  }
}
