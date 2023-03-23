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
