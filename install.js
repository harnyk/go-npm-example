#!/usr/bin/env node

const os = require('os');
const download = require('download');

const mapNodeArchToGoArch = {
    arm: 'arm',
    arm64: 'arm64',
    ia32: '386',
    mips: 'mips',
    mipsel: 'mipsle',
    ppc: 'ppc',
    ppc64: 'ppc64',
    s390: 's390',
    s390x: 's390x',
    x64: 'amd64',
};

const mapPlatformToGoPlatform = {
    darwin: 'darwin',
    freebsd: 'freebsd',
    linux: 'linux',
    openbsd: 'openbsd',
    sunos: 'solaris',
    win32: 'windows',
    aix: 'aix',
};

const getArch = () => {
    const arch = os.arch();
    return mapNodeArchToGoArch[arch];
};

const getPlatform = () => {
    const platform = os.platform();
    return mapPlatformToGoPlatform[platform];
};

const main = async () => {
    const version = require('./package.json').version;
    const arch = getArch();
    const platform = getPlatform();
    const url = `https://github.com/harnyk/go-npm-example/releases/download/v${version}/pepyaka_${version}_${platform}_${arch}.tar.gz`;

    console.log(`Downloading ${url}`);
    await download(url, './bin', { extract: true });
    console.log('Done');
};

main().catch((e) => {
    console.error(e.stack);
    process.exit(1);
});
