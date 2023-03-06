export default {
  view: {
    edge: {
      cache: false,
    },
    disks: {
      admin: Path.stubs('views/admin'),
      component: Path.stubs('views/components'),
    },
  },
}
