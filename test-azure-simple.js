/**
 * Simple Azure Blob Storage Test Script
 * Tests Azure connection without requiring dotenv
 */

const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

// Your Azure credentials (hardcoded for testing)
const AZURE_STORAGE_ACCOUNT_NAME = "aethershare";
const AZURE_STORAGE_ACCOUNT_KEY = "25kQ5vFVQ7lJd3XUITxcA4G94BaFlXXERwryt5KygrwLzWzEetGAP6Nb3v0Z3j+TILMmf69ybE4o+AStE80B1g==";
const AZURE_STORAGE_CONTAINER_NAME = "aether-share-storage";

async function testAzureSetup() {
  console.log('🔍 Testing Azure Blob Storage Configuration...\n');

  // Check credentials
  console.log('📋 Azure Credentials:');
  console.log('AZURE_STORAGE_ACCOUNT_NAME:', AZURE_STORAGE_ACCOUNT_NAME ? '✅ Set' : '❌ Missing');
  console.log('AZURE_STORAGE_ACCOUNT_KEY:', AZURE_STORAGE_ACCOUNT_KEY ? '✅ Set' : '❌ Missing');
  console.log('AZURE_STORAGE_CONTAINER_NAME:', AZURE_STORAGE_CONTAINER_NAME || '❌ Missing');
  console.log('');

  try {
    // Initialize Azure Blob Storage client
    const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY);
    const blobServiceClient = new BlobServiceClient(
      `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      sharedKeyCredential
    );

    // Test connection by listing containers
    console.log('🔗 Testing Azure connection...');
    const containers = [];
    for await (const container of blobServiceClient.listContainers()) {
      containers.push(container.name);
    }
    
    console.log('✅ Azure connection successful!');
    console.log('📦 Available containers:');
    containers.forEach(container => {
      console.log(`   - ${container}`);
    });

    // Check if your container exists
    const containerExists = containers.includes(AZURE_STORAGE_CONTAINER_NAME);
    if (containerExists) {
      console.log(`✅ Your container "${AZURE_STORAGE_CONTAINER_NAME}" exists!`);
      
      // Test container access
      const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME);
      const properties = await containerClient.getProperties();
      console.log(`📊 Container properties:`);
      console.log(`   - Created: ${properties.createdOn}`);
      console.log(`   - Last Modified: ${properties.lastModified}`);
      console.log(`   - Access Level: ${properties.publicAccess || 'Private'}`);
      
      // List some blobs (if any)
      const blobs = [];
      for await (const blob of containerClient.listBlobsFlat()) {
        blobs.push(blob.name);
      }
      
      if (blobs.length > 0) {
        console.log(`📁 Found ${blobs.length} blob(s):`);
        blobs.slice(0, 5).forEach(blob => {
          console.log(`   - ${blob}`);
        });
        if (blobs.length > 5) {
          console.log(`   ... and ${blobs.length - 5} more`);
        }
      } else {
        console.log('📁 Container is empty (no blobs found)');
      }
      
    } else {
      console.log(`❌ Your container "${AZURE_STORAGE_CONTAINER_NAME}" not found!`);
      console.log('   Please create the container in Azure Portal.');
      console.log('   Container name should be: aether-share-storage');
    }

    console.log('\n🎉 Azure setup looks good! You can now test file uploads.');

  } catch (error) {
    console.log('❌ Azure connection failed:');
    console.log('Error:', error.message);
    
    if (error.message.includes('AuthenticationFailed')) {
      console.log('\n💡 Solution: Check your storage account name and key');
    } else if (error.message.includes('AccountNotFound')) {
      console.log('\n💡 Solution: Check your storage account name');
    } else if (error.message.includes('ContainerNotFound')) {
      console.log('\n💡 Solution: Create the container in Azure Portal');
    } else if (error.message.includes('Forbidden')) {
      console.log('\n💡 Solution: Check your storage account key and permissions');
    }
  }
}

testAzureSetup();
