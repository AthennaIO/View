import { Path } from '@athenna/common'

export default {
  disks: {
    admin: Path.stubs('views/admin'),
    component: Path.stubs('views/components'),
  },

  edge: {
    cache: false,
  },
}
