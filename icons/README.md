# Dynamic Icon System

The app now uses a **dynamic icon system** that automatically searches and downloads icons when users add new tasks!

## How It Works

1. When a user adds a new task, the system:
   - Checks if an icon is already cached
   - If not, searches for an icon using the task keyword
   - Downloads and caches the icon automatically
   - Displays it in the routine list

2. Icons are cached in browser localStorage for fast loading

## Current Implementation

The system currently uses **Iconify API** (which supports hand-drawn icons) as a working example. You can easily swap this for Flaticon's API.

## To Use Flaticon API Instead

1. Get a Flaticon API key from: https://www.flaticon.com/api
2. Update the `fetchIconFromAPI()` function in `app.js`:

```javascript
async function fetchIconFromAPI(keyword) {
    try {
        // Search Flaticon
        const searchResponse = await fetch(
            `https://api.flaticon.com/v3/search?q=${keyword}&limit=1`,
            {
                headers: {
                    'Authorization': 'Bearer YOUR_FLATICON_API_KEY',
                    'Accept': 'application/json'
                }
            }
        );
        
        if (searchResponse.ok) {
            const data = await searchResponse.json();
            if (data.data && data.data.length > 0) {
                const iconId = data.data[0].id;
                
                // Download the icon
                const downloadResponse = await fetch(
                    `https://api.flaticon.com/v3/item/${iconId}/download`,
                    {
                        headers: {
                            'Authorization': 'Bearer YOUR_FLATICON_API_KEY'
                        }
                    }
                );
                
                if (downloadResponse.ok) {
                    const downloadData = await downloadResponse.json();
                    return downloadData.data.svg; // Return SVG content
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching icon from Flaticon:', error);
        return null;
    }
}
```

## Manual Icon Addition (Fallback)

If you want to manually add icons, save them in this folder as `[icon-name].svg`. The system will use them if found locally before trying to fetch from API.
