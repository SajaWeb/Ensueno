function readPackage(pkg, context) {
  if (pkg.name === 'prisma') {
    if (pkg.scripts && pkg.scripts.preinstall) {
      delete pkg.scripts.preinstall;
      context.log('Removed preinstall script from prisma package to allow build on Node < 20.19');
    }
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
