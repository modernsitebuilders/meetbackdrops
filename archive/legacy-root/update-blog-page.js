const fs = require('fs');

const filePath = 'pages/blog.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add bokeh blog post to the blogPosts array (add it after job-interview-backgrounds at the top)
content = content.replace(
  `  const blogPosts = [
    {
    title: "Best Virtual Backgrounds for Job Interviews 2025: Complete Guide",
    slug: "job-interview-backgrounds",
    excerpt: "Choose the perfect virtual background for your job interview. Expert tips on professional backgrounds, what to avoid, and how to make a great first impression on video calls.",
    date: "January 2025",
    readTime: "12 min read",
    category: "Career Guide"
  },`,
  `  const blogPosts = [
    {
    title: "Best Virtual Backgrounds for Job Interviews 2025: Complete Guide",
    slug: "job-interview-backgrounds",
    excerpt: "Choose the perfect virtual background for your job interview. Expert tips on professional backgrounds, what to avoid, and how to make a great first impression on video calls.",
    date: "January 2025",
    readTime: "12 min read",
    category: "Career Guide"
  },
    {
    title: "Free Bokeh Virtual Backgrounds for Video Calls 2025",
    slug: "bokeh-backgrounds",
    excerpt: "Download 66 free bokeh virtual backgrounds for Zoom, Teams, and Google Meet. Elegant soft-focus light effects and artistic blur backgrounds perfect for professional video calls.",
    date: "November 6, 2025",
    readTime: "10 min read",
    category: "Background Collections"
  },`
);

// Also add to schema structured data
content = content.replace(
  `              {
                "@type": "BlogPosting",
                "headline": "Best Free Virtual Background Sites in 2025: Complete Comparison",
                "url": "https://meetbackdrops.com/blog/best-virtual-background-sites-2025"
              },`,
  `              {
                "@type": "BlogPosting",
                "headline": "Free Bokeh Virtual Backgrounds for Video Calls 2025",
                "url": "https://meetbackdrops.com/blog/bokeh-backgrounds"
              },
              {
                "@type": "BlogPosting",
                "headline": "Best Free Virtual Background Sites in 2025: Complete Comparison",
                "url": "https://meetbackdrops.com/blog/best-virtual-background-sites-2025"
              },`
);

fs.writeFileSync(filePath, content);
console.log('✓ Updated pages/blog.js');
