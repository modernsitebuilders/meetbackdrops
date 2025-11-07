// This file submits all your important URLs to IndexNow at once

async function submitToIndexNow(url) {
  try {
    const response = await fetch('https://streambackdrops.com/api/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅', url);
      return true;
    } else {
      console.log('❌', url, data);
      return false;
    }
  } catch (error) {
    console.log('❌', url, error.message);
    return false;
  }
}

async function submitAllURLs() {
  const urls = [
    // Homepage
    'https://streambackdrops.com',
    
    // Info pages
    'https://streambackdrops.com/about',
    'https://streambackdrops.com/contact',
    'https://streambackdrops.com/faq',
    'https://streambackdrops.com/license',
    'https://streambackdrops.com/privacy',
    'https://streambackdrops.com/terms',
    
    // Category pages (all 15 categories)
    'https://streambackdrops.com/category/bookshelves-bright',
    'https://streambackdrops.com/category/bookshelves-dark',
    'https://streambackdrops.com/category/office-spaces',
    'https://streambackdrops.com/category/living-rooms',
    'https://streambackdrops.com/category/kitchens',
    'https://streambackdrops.com/category/coffee-shops',
    'https://streambackdrops.com/category/art-galleries',
    'https://streambackdrops.com/category/urban-lofts',
    'https://streambackdrops.com/category/gardens-patios',
    'https://streambackdrops.com/category/historic-spaces',
    'https://streambackdrops.com/category/nature-landscapes',
    'https://streambackdrops.com/category/libraries',
    'https://streambackdrops.com/category/christmas-backgrounds',
    'https://streambackdrops.com/category/halloween-backgrounds',
    'https://streambackdrops.com/category/bokeh-backgrounds',
    
    // Blog index
    'https://streambackdrops.com/blog',
    
    // Blog posts (all 13 blog posts)
    'https://streambackdrops.com/blog/job-interview-backgrounds',
    'https://streambackdrops.com/blog/bokeh-backgrounds',
    'https://streambackdrops.com/blog/best-virtual-background-sites-2025',
    'https://streambackdrops.com/blog/professional-video-calls',
    'https://streambackdrops.com/blog/video-call-etiquette',
    'https://streambackdrops.com/blog/remote-work-productivity',
    'https://streambackdrops.com/blog/backgrounds-by-industry',
    'https://streambackdrops.com/blog/background-mistakes',
    'https://streambackdrops.com/blog/lighting-tips',
    'https://streambackdrops.com/blog/virtual-background-guide',
    'https://streambackdrops.com/blog/zoom-teams-google',
    'https://streambackdrops.com/blog/christmas-backgrounds',
    'https://streambackdrops.com/blog/halloween-backgrounds'
  ];
  
  console.log(`\n🚀 Submitting ${urls.length} URLs to IndexNow...\n`);
  
  let successCount = 0;
  
  for (const url of urls) {
    const success = await submitToIndexNow(url);
    if (success) successCount++;
    
    // Wait 1 second between submissions to be polite
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n✅ Submitted ${successCount}/${urls.length} URLs successfully!`);
}

submitAllURLs();