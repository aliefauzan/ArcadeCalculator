export async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        console.error(`Attempt ${attempt}: Failed to fetch ${url} with status: ${response.status}`);
        
        if (attempt < maxRetries) {
          let delayMs = 1000;
          
          if (response.status === 429) {
            delayMs = Math.min(2000 * Math.pow(2, attempt - 1), 8000);
            console.log(`⏳ Rate limited (429). Waiting ${delayMs}ms before retry ${attempt + 1}...`);
          } else if (response.status === 403) {
            delayMs = 1500;
            console.log(`🚫 Access forbidden (403). Waiting ${delayMs}ms before retry ${attempt + 1}...`);
          } else if (response.status >= 500) {
            delayMs = 1000;
            console.log(`🔄 Server error (${response.status}). Waiting ${delayMs}ms before retry ${attempt + 1}...`);
          } else {
            delayMs = 500;
            console.log(`⚠️ Client error (${response.status}). Waiting ${delayMs}ms before retry ${attempt + 1}...`);
          }
          
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        console.error(`❌ All ${maxRetries} attempts failed for ${url} - final status: ${response.status}`);
        throw new Error(`Failed to fetch after ${maxRetries} attempts: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error(`Attempt ${attempt}: Network error for ${url}:`, error);
      if (attempt < maxRetries) {
        const delayMs = 1000 * attempt;
        console.log(`🔄 Network error. Waiting ${delayMs}ms before retry ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
  
  throw new Error(`All ${maxRetries} attempts failed for ${url}`);
}
