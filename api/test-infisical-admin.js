#!/usr/bin/env node

/**
 * Test script for Infisical homelab-admin integration
 *
 * Usage:
 *   INFISICAL_ADMIN_TOKEN=<see Vikunja #1103> node test-infisical-admin.js
 */

const infisicalAdmin = require('./config/infisical-admin');

async function testInfisicalAdmin() {
  console.log('🧪 Testing Infisical Admin Integration (homelab-admin)\n');
  console.log('='.repeat(60));

  // Step 1: Check environment variables
  console.log('\n1️⃣  Checking Environment Variables:');
  console.log('   INFISICAL_ADMIN_TOKEN:', process.env.INFISICAL_ADMIN_TOKEN ? '✅ Set' : '❌ Not set');
  console.log('   INFISICAL_SITE_URL:', process.env.INFISICAL_SITE_URL || 'Using default: https://infisical.internal.lakehouse.wtf');
  console.log('   INFISICAL_ADMIN_ENV:', process.env.INFISICAL_ADMIN_ENV || 'Using default: prod');

  if (!process.env.INFISICAL_ADMIN_TOKEN) {
    console.error('\n❌ INFISICAL_ADMIN_TOKEN not set!');
    console.log('\nTo test, run:');
    console.log('   INFISICAL_ADMIN_TOKEN=<see Vikunja #1103> node test-infisical-admin.js\n');
    process.exit(1);
  }

  // Step 2: Initialize Infisical Admin
  console.log('\n2️⃣  Initializing Infisical Admin Client:');
  try {
    await infisicalAdmin.initialize();
    console.log('   ✅ Infisical Admin initialized successfully');
  } catch (error) {
    console.error('   ❌ Failed to initialize:', error.message);
    process.exit(1);
  }

  // Step 3: Test listing secrets
  console.log('\n3️⃣  Testing Secret Listing:');
  try {
    const secrets = await infisicalAdmin.listSecrets();
    console.log(`   ✅ Found ${secrets.length} secrets in homelab-admin`);
    if (secrets.length > 0) {
      console.log('   Secrets:');
      secrets.slice(0, 10).forEach(name => {
        console.log(`     - ${name}`);
      });
      if (secrets.length > 10) {
        console.log(`     ... and ${secrets.length - 10} more`);
      }
    } else {
      console.log('   ℹ️  No secrets found. Add some via the Infisical web UI.');
    }
  } catch (error) {
    console.error('   ❌ Failed to list secrets:', error.message);
  }

  // Step 4: Test retrieving a secret (with fallback)
  console.log('\n4️⃣  Testing Secret Retrieval (with fallback):');
  process.env.TEST_FALLBACK = 'fallback-value-from-env';
  const testSecret = await infisicalAdmin.getSecret('TEST_SECRET', 'prod', 'TEST_FALLBACK');
  if (testSecret) {
    console.log('   ✅ Retrieved test secret');
    console.log(`   Value: ${testSecret.substring(0, 20)}${testSecret.length > 20 ? '...' : ''}`);
  } else {
    console.log('   ⚠️  Test secret not found (this is okay if you haven\'t added it yet)');
  }

  // Step 5: Test helper methods
  console.log('\n5️⃣  Testing Helper Methods:');

  // Test Proxmox credentials
  console.log('\n   Testing Proxmox credentials...');
  try {
    const proxmox = await infisicalAdmin.getProxmoxCredentials();
    if (proxmox.host || proxmox.username || proxmox.password) {
      console.log('   ✅ Proxmox credentials:');
      console.log(`     Host: ${proxmox.host || '(not set)'}`);
      console.log(`     Username: ${proxmox.username || '(not set)'}`);
      console.log(`     Password: ${proxmox.password ? '[REDACTED]' : '(not set)'}`);
      console.log(`     API Token: ${proxmox.apiToken ? '[REDACTED]' : '(not set)'}`);
    } else {
      console.log('   ℹ️  Proxmox credentials not configured yet');
    }
  } catch (error) {
    console.error('   ❌ Failed to get Proxmox credentials:', error.message);
  }

  // Test AdGuard credentials
  console.log('\n   Testing AdGuard credentials...');
  try {
    const adguard = await infisicalAdmin.getAdGuardCredentials();
    if (adguard.username || adguard.password) {
      console.log('   ✅ AdGuard credentials:');
      console.log(`     Primary URL: ${adguard.primaryUrl}`);
      console.log(`     Secondary URL: ${adguard.secondaryUrl}`);
      console.log(`     Username: ${adguard.username || '(not set)'}`);
      console.log(`     Password: ${adguard.password ? '[REDACTED]' : '(not set)'}`);
    } else {
      console.log('   ℹ️  AdGuard credentials not configured yet');
    }
  } catch (error) {
    console.error('   ❌ Failed to get AdGuard credentials:', error.message);
  }

  // Test KEA DHCP config
  console.log('\n   Testing KEA DHCP configuration...');
  try {
    const kea = await infisicalAdmin.getKeaDhcpConfig();
    console.log('   ✅ KEA DHCP configuration:');
    console.log(`     Primary Host: ${kea.primaryHost}`);
    console.log(`     Secondary Host: ${kea.secondaryHost}`);
    console.log(`     API Port: ${kea.apiPort}`);
    console.log(`     Config Path: ${kea.configPath}`);
  } catch (error) {
    console.error('   ❌ Failed to get KEA DHCP config:', error.message);
  }

  // Step 6: Test cache
  console.log('\n6️⃣  Testing Cache:');
  const start = Date.now();
  await infisicalAdmin.getSecret('TEST_SECRET', 'prod', 'TEST_FALLBACK');
  const cachedTime = Date.now() - start;
  console.log(`   Cached retrieval: ${cachedTime}ms ✅`);

  console.log('\n7️⃣  Testing Cache Clear:');
  infisicalAdmin.clearCache();
  console.log('   ✅ Cache cleared');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Infisical Admin Integration Test Complete!\n');
  console.log('Next Steps:');
  console.log('1. Add infrastructure secrets to homelab-admin via the web UI:');
  console.log('   - PROXMOX_HOST, PROXMOX_USERNAME, PROXMOX_PASSWORD');
  console.log('   - ADGUARD_USERNAME, ADGUARD_PASSWORD');
  console.log('   - KEA_PRIMARY_HOST, KEA_SECONDARY_HOST');
  console.log('   - CLOUDFLARE_API_KEY, CLOUDFLARE_ZONE_ID');
  console.log('2. Use infisicalAdmin in your automation scripts');
  console.log('3. Test with actual infrastructure operations\n');
}

// Run the test
testInfisicalAdmin().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
