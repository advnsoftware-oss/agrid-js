#!/usr/bin/env node

/**
 * Script để kiểm tra dependencies và trạng thái publish của tất cả packages
 * Giúp phát hiện packages nào chưa publish nhưng được reference như dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PACKAGES = [
  { name: 'agrid-js', path: 'packages/browser' },
  { name: 'agrid-js-lite', path: 'packages/web' },
  { name: 'agrid-node', path: 'packages/node' },
  { name: 'agrid-react-native', path: 'packages/react-native' },
  { name: '@agrid/core', path: 'packages/core' },
  { name: '@agrid/react', path: 'packages/react' },
  { name: '@agrid/nuxt', path: 'packages/nuxt' },
  { name: '@agrid/nextjs-config', path: 'packages/nextjs-config' },
  { name: '@agrid/ai', path: 'packages/ai' },
];

const ROOT_DIR = path.resolve(__dirname, '..');

function checkNpmPackage(packageName) {
  try {
    const version = execSync(`npm view "${packageName}" version`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: ROOT_DIR,
    }).trim();
    return { exists: true, version };
  } catch (error) {
    return { exists: false, version: null };
  }
}

function getPackageDependencies(packagePath) {
  const packageJsonPath = path.join(ROOT_DIR, packagePath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return { dependencies: [], peerDependencies: [] };
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const dependencies = Object.entries(packageJson.dependencies || {})
    .filter(([name]) => name.startsWith('@agrid/') || name.startsWith('agrid-'))
    .map(([name, version]) => ({ name, version }));

  const peerDependencies = Object.entries(packageJson.peerDependencies || {})
    .filter(([name]) => name.startsWith('@agrid/') || name.startsWith('agrid-'))
    .map(([name, version]) => ({ name, version }));

  return { dependencies, peerDependencies };
}

function getPackageVersion(packagePath) {
  const packageJsonPath = path.join(ROOT_DIR, packagePath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  return packageJson.version;
}

function main() {
  console.log('🔍 Kiểm tra trạng thái publish và dependencies của packages...\n');

  const results = PACKAGES.map((pkg) => {
    const npmStatus = checkNpmPackage(pkg.name);
    const localVersion = getPackageVersion(pkg.path);
    const { dependencies, peerDependencies } = getPackageDependencies(pkg.path);

    return {
      ...pkg,
      npmStatus,
      localVersion,
      dependencies,
      peerDependencies,
    };
  });

  // Phân loại packages
  const published = results.filter((r) => r.npmStatus.exists);
  const notPublished = results.filter((r) => !r.npmStatus.exists);

  console.log('='.repeat(80));
  console.log('📊 TỔNG KẾT');
  console.log('='.repeat(80));
  console.log(`✅ Đã publish: ${published.length} packages`);
  console.log(`❌ Chưa publish: ${notPublished.length} packages\n`);

  // Packages đã publish
  console.log('='.repeat(80));
  console.log('✅ PACKAGES ĐÃ PUBLISH');
  console.log('='.repeat(80));
  published.forEach((pkg) => {
    console.log(`\n📦 ${pkg.name}`);
    console.log(`   Version trên npm: ${pkg.npmStatus.version}`);
    console.log(`   Version local: ${pkg.localVersion}`);
    if (pkg.dependencies.length > 0) {
      console.log(`   Dependencies:`);
      pkg.dependencies.forEach((dep) => {
        const depStatus = checkNpmPackage(dep.name);
        const status = depStatus.exists ? '✅' : '❌';
        console.log(`     ${status} ${dep.name}@${dep.version}`);
        if (!depStatus.exists) {
          console.log(`        ⚠️  CHƯA PUBLISH - CÓ THỂ GÂY LỖI!`);
        }
      });
    }
    if (pkg.peerDependencies.length > 0) {
      console.log(`   Peer Dependencies:`);
      pkg.peerDependencies.forEach((dep) => {
        const depStatus = checkNpmPackage(dep.name);
        const status = depStatus.exists ? '✅' : '⚠️';
        console.log(`     ${status} ${dep.name}@${dep.version}`);
        if (!depStatus.exists) {
          console.log(`        ⚠️  CHƯA PUBLISH - Cần publish trước khi dùng package này`);
        }
      });
    }
  });

  // Packages chưa publish
  console.log('\n' + '='.repeat(80));
  console.log('❌ PACKAGES CHƯA PUBLISH');
  console.log('='.repeat(80));
  notPublished.forEach((pkg) => {
    console.log(`\n📦 ${pkg.name}`);
    console.log(`   Version local: ${pkg.localVersion}`);
    if (pkg.dependencies.length > 0) {
      console.log(`   Dependencies cần publish trước:`);
      pkg.dependencies.forEach((dep) => {
        const depStatus = checkNpmPackage(dep.name);
        const status = depStatus.exists ? '✅' : '❌';
        console.log(`     ${status} ${dep.name}@${dep.version}`);
        if (!depStatus.exists) {
          console.log(`        ⚠️  CHƯA PUBLISH - Cần publish trước!`);
        }
      });
    }
    if (pkg.peerDependencies.length > 0) {
      console.log(`   Peer Dependencies:`);
      pkg.peerDependencies.forEach((dep) => {
        const depStatus = checkNpmPackage(dep.name);
        const status = depStatus.exists ? '✅' : '⚠️';
        console.log(`     ${status} ${dep.name}@${dep.version}`);
      });
    }
  });

  // Tìm packages có dependencies chưa publish
  console.log('\n' + '='.repeat(80));
  console.log('🚨 PACKAGES CÓ THỂ BỊ LỖI (Dependencies chưa publish)');
  console.log('='.repeat(80));
  const problematicPackages = results.filter((pkg) => {
    if (!pkg.npmStatus.exists) return false;
    return pkg.dependencies.some((dep) => {
      const depStatus = checkNpmPackage(dep.name);
      return !depStatus.exists;
    });
  });

  if (problematicPackages.length === 0) {
    console.log('✅ Không có packages nào bị lỗi!');
  } else {
    problematicPackages.forEach((pkg) => {
      console.log(`\n❌ ${pkg.name} (v${pkg.npmStatus.version})`);
      console.log(`   Đã publish nhưng có dependencies chưa publish:`);
      pkg.dependencies.forEach((dep) => {
        const depStatus = checkNpmPackage(dep.name);
        if (!depStatus.exists) {
          console.log(`     ❌ ${dep.name}@${dep.version} - CHƯA PUBLISH`);
          console.log(`        → Cần publish ngay để fix lỗi!`);
        }
      });
    });
  }

  // Thứ tự publish đề xuất
  console.log('\n' + '='.repeat(80));
  console.log('📋 THỨ TỰ PUBLISH ĐỀ XUẤT');
  console.log('='.repeat(80));

  const publishOrder = [];
  const publishedSet = new Set(published.map((p) => p.name));

  function canPublish(pkg) {
    // Kiểm tra tất cả dependencies đã publish chưa
    const depsReady = pkg.dependencies.every((dep) => {
      if (dep.version.includes('workspace:')) {
        // workspace dependency - cần check package trong monorepo
        return publishedSet.has(dep.name);
      }
      return checkNpmPackage(dep.name).exists;
    });
    return depsReady;
  }

  const remaining = [...notPublished];
  let iterations = 0;
  const maxIterations = PACKAGES.length;

  while (remaining.length > 0 && iterations < maxIterations) {
    iterations++;
    const ready = remaining.filter((pkg) => canPublish(pkg));
    if (ready.length === 0) {
      // Không có package nào có thể publish (có thể có circular dependency)
      break;
    }
    ready.forEach((pkg) => {
      publishOrder.push(pkg);
      publishedSet.add(pkg.name);
      const index = remaining.indexOf(pkg);
      if (index > -1) remaining.splice(index, 1);
    });
  }

  if (remaining.length > 0) {
    console.log('\n⚠️  Các packages sau có thể có circular dependencies hoặc dependencies phức tạp:');
    remaining.forEach((pkg) => {
      console.log(`   - ${pkg.name}`);
    });
  }

  publishOrder.forEach((pkg, index) => {
    console.log(`\n${index + 1}. ${pkg.name} (v${pkg.localVersion})`);
    if (pkg.dependencies.length > 0) {
      console.log(`   Dependencies: ${pkg.dependencies.map((d) => d.name).join(', ')}`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ Hoàn thành kiểm tra!');
  console.log('='.repeat(80));
}

main();

