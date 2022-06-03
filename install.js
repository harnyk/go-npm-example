#!/usr/bin/env node

const os = require('os');
const download = require('download');
const cp = require('child_process');
const isInstalledGlobally = require('is-installed-globally');
const { copyFileSync, chmodSync } = require('fs');
const { join } = require('path');

const getArch = () =>
    ({
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
    }[os.arch()]);

const getPlatform = () =>
    ({
        darwin: 'darwin',
        freebsd: 'freebsd',
        linux: 'linux',
        openbsd: 'openbsd',
        sunos: 'solaris',
        win32: 'windows',
        aix: 'aix',
    }[os.platform()]);

const getBinPath = () =>
    cp
        .execSync(`npm bin ${isInstalledGlobally ? '-g' : ''}`)
        .toString()
        .trim();

const main = async () => {
    const binName = 'pepyaka';
    const version = require('./package.json').version;
    const arch = getArch();
    const platform = getPlatform();
    const url = `https://github.com/harnyk/go-npm-example/releases/download/v${version}/${binName}_${version}_${platform}_${arch}.tar.gz`;
    const binFileName = `${binName}${platform === 'windows' ? '.exe' : ''}`;
    const binPath = getBinPath();
    const downloadPath = join(__dirname, 'bin');

    console.log(`Downloading ${url}`);
    await download(url, downloadPath, { extract: true });
    console.log(`Copying to ${binPath}`);
    copyFileSync(join(downloadPath, binFileName), join(binPath, binFileName));
    if (platform !== 'windows') {
        chmodSync(join(binPath, binFileName), 0o755);
    }
    console.log(`${binFileName} is installed`);
};

main().catch((e) => {
    console.error(e.stack);
    process.exit(1);
});
