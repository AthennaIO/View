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
import { File, Folder, Is, Path } from '@athenna/common'
import { EmptyComponentException } from '#src/Exceptions/EmptyComponentException'

export class ViewImpl {
  /**
   * Edge instance that is handling all the views.
   */
  public edge: Edge

  public constructor() {
    this.edge = new Edge(Config.get('view.edge'))

    this.registerDisks()
    this.registerTemplates()
    this.registerCustomTemplates()
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
    this.edge.unmount(name)

    return this
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
    if (!File.existsSync(templatePath)) {
      return this
    }

    return this.createTemplate(
      name,
      new File(templatePath).getContentSync().toString(),
    )
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
    return this.removeTemplate(name)
  }

  /**
   * Register all disks from "view.disks" configuration.
   */
  private registerDisks() {
    const disks = Config.get('view.disks')

    Object.keys(disks).forEach(k => this.createViewDisk(k, disks[k]))
  }

  /**
   * Register all templates from "view.templates" configuration.
   */
  private registerTemplates() {
    if (this.cantRegisterTemplates()) {
      return
    }

    const templates = Config.get('view.templates.paths')

    Object.keys(templates).forEach(k => {
      this.createTemplateByPath(`artisan::${k}`, templates[k])
    })
  }

  /**
   * Register all templates inside some path. The file name
   * will be used to make the registration. All the templates
   * registered with this method will start with "artisan::...".
   *
   * If "view.templates.useCustom" is set to false, Athenna will
   * not register custom templates.
   */
  private registerCustomTemplates(path = Path.resources('templates')) {
    if (this.cantRegisterTemplates()) {
      return
    }

    if (!Config.get('view.templates.useCustom', true)) {
      return
    }

    if (!Folder.existsSync(path)) {
      return
    }

    new Folder(path)
      .getFilesByPattern('**/*.edge', true)
      .forEach(template =>
        this.createTemplate(
          `artisan::${template.name}`,
          template.getContentSync().toString(),
        ),
      )
  }

  /**
   * Verify if is production and "view.templates.registerInProduction"
   * is not true. There are no need to register templates when running
   * the application in production because we are not going to make files.
   *
   * But, depending on the application that the developer is building he
   * can set "view.templates.registerInProduction" to true.
   */
  private cantRegisterTemplates() {
    return !(
      Config.get('app.env', 'production') === 'production' &&
      !Config.get('view.templates.registerInProduction', false)
    )
  }
}
