import { Path } from '@athenna/common'

export default {
  disks: {
    admin: Path.fixtures('views/admin'),
    component: Path.fixtures('views/components')
  },

  edge: {
    cache: false
  }
}
