import databaseService from './services/database.js';

// Simple test to verify Firebase connection
const testConnection = async () => {
  console.log('🔥 Testing Firebase connection to Discord bot database...');
  
  try {
    // Test connection with enhanced debugging
    const result = await databaseService.debugConnection();
    
    if (result) {
      console.log('✅ Successfully connected to Discord bot database!');
      
      // Try to find Athena specifically
      console.log('\n� Searching for Athena specifically...');
      const athenaData = await databaseService.getFaction("The Solar Wars", "athena");
      if (athenaData) {
        console.log('👑 Athena found!', athenaData);
      } else {
        console.log('❌ Athena not found in "The Solar Wars" server');
        
        // Try other possible server names
        const possibleServers = ["test", "main", "discord", "bot"];
        for (const server of possibleServers) {
          console.log(`🔍 Trying server: "${server}"`);
          try {
            const testData = await databaseService.getFaction(server, "athena");
            if (testData) {
              console.log(`✅ Found Athena in server "${server}":`, testData);
              break;
            }
          } catch (error) {
            console.log(`❌ Server "${server}" failed:`, error.message);
          }
        }
      }
    } else {
      console.log('❌ Connection failed');
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
};

// Export for use in browser console
window.testDiscordBotConnection = testConnection;
window.databaseService = databaseService;

console.log('🚀 Discord bot database test function loaded!');
console.log('💡 Type "testDiscordBotConnection()" in browser console to test connection');
console.log('💡 Or use "databaseService.debugConnection()" for detailed debugging');

export default testConnection;
