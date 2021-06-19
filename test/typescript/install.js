var packageInfo = require("../../package.json");
const { execSync } = require('child_process');

if (packageInfo) {
    const version = packageInfo.version;
    console.log('version', version);
    execSync(`npm pack`);
    execSync(`cd test/typescript && npm un jsstore-encrypt && npm i ../../jsstore-encrypt-${version}.tgz --no-save`);
    console.log('building')
    // execSync(`cd test/typescript && npm run build`);

}
else {
    throw "no package found";
}
