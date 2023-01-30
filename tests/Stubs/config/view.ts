import { Path } from '@athenna/common'

export default {
  /*
  |--------------------------------------------------------------------------
  | Disks
  |--------------------------------------------------------------------------
  |
  | Most templating systems load templates from disk. Here you may specify
  | a key value map that will have the disk name pointing to the respective
  | path that should be checked to load all the views inside.
  |
  */

  disks: {
    admin: Path.stubs('views/admin'),
    component: Path.stubs('views/components'),
  },

  /*
  |--------------------------------------------------------------------------
  | Templates
  |--------------------------------------------------------------------------
  |
  | Templates are used by Artisan "make:..." commands to create your files.
  | all the options defined here will be loaded by View Facade on bootstrap.
  |
  */

  templates: {
    /*
    |--------------------------------------------------------------------------
    | Paths
    |--------------------------------------------------------------------------
    |
    | Here you may specify a key value map that will have the template name
    | pointing to the respective path that should be checked to load the view.
    |
    */

    paths: {
      command: Path.stubs('views/command.edge'),
    },

    /*
    |--------------------------------------------------------------------------
    | Register templates
    |--------------------------------------------------------------------------
    |
    | Set if View Facade should register templates automatically. Setting this
    | option to "false" will let the bootstrap of the application more performatic,
    | but you are not going to be able to run Artisan "make:..." commands.
    |
    */

    register: true,

    /*
    |--------------------------------------------------------------------------
    | Use custom templates
    |--------------------------------------------------------------------------
    |
    | Set if View Facade should use custom template files registered inside
    | "resources/templates" folder by "node artisan template:customize" command.
    | Setting this option as "false" will let the bootstrap of the application
    | more performatic, but Athenna will not be able to auto register the
    | templates of "resources/templates" folder, but you can manually register
    | the templates in the "view.templates.paths" object above.
    |
    */

    useCustom: true,
  },

  /*
  |--------------------------------------------------------------------------
  | Edge options
  |--------------------------------------------------------------------------
  |
  | Athenna uses the Edge.js template engine to render templates. You can set
  | all Edge supported options here.
  |
  */

  edge: {
    /*
    |--------------------------------------------------------------------------
    | Cache
    |--------------------------------------------------------------------------
    |
    | Compiling a template to a JavaScript function is a time-consuming process,
    | and hence it is recommended to cache the compiled templates in production.
    |
    | You can control the template caching using this options. Just make sure
    | to set the value to true in the production environment.
    |
    */

    cache: false,
  },
}
