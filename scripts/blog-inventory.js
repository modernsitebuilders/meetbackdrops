// scripts/blog-inventory.js
import { blogPosts, BLOG_CATEGORIES, getCategoryCounts } from '../data/blogPosts.js';

console.log('\n📰 STREAMBACKDROPS BLOG INVENTORY\n');

// Live vs Garage
const livePosts = blogPosts.filter(p => p.live === true);
const garagePosts = blogPosts.filter(p => p.live === false);

console.log(`✅ LIVE: ${livePosts.length} posts\n`);
livePosts.sort((a, b) => a.sortOrder - b.sortOrder).forEach(post => {
  console.log(`  ✅ ${post.slug.padEnd(35)} ${post.category.padEnd(20)} ${post.publishDate}`);
});

console.log(`\n📦 GARAGE: ${garagePosts.length} posts\n`);
garagePosts.forEach(post => {
  console.log(`  📦 ${post.slug.padEnd(35)} ${post.category.padEnd(20)} (draft)`);
});

// Category breakdown
console.log('\n📊 CATEGORY BREAKDOWN:');
const categoryCounts = getCategoryCounts();
Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    console.log(`  ${cat.padEnd(25)} ${count} posts`);
  });

// Featured posts
const featured = livePosts.filter(p => p.featured).length;
console.log(`\n⭐ FEATURED POSTS: ${featured}/${livePosts.length}`);

// Post dates
const dates = livePosts.map(p => p.publishDate).sort();
console.log(`\n📅 DATE RANGE: ${dates[0]} to ${dates[dates.length-1]}`);

console.log(`\n📊 TOTAL: ${blogPosts.length} posts (${livePosts.length} live, ${garagePosts.length} garage)`);