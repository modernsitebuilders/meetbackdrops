import Card from './Card';
import { CATEGORIES } from '../lib/categories-config';
import styles from '../styles/HomePage.module.css';

const CDN = 'https://assets.streambackdrops.com/webp';

export default function CategoryGrid({ navigate }) {
  return (
    <div id="categories" className={`${styles.categoryGrid} category-grid`}>
      <Card href="/category/bookshelves" title="Bookshelves" description="Professional bookshelf virtual backgrounds — bright and dark lighting — for video calls and presentations" imageSrc={`${CDN}/bookshelves-bright/bookshelves-bright-42.webp`} imageAlt="Bookshelf background for video calls" navigate={navigate} priority={false} count={CATEGORIES['bookshelves'].count} />
      <Card href="/category/wall-shelves" title="Wall Shelves" description="Clean, minimalist wall shelf virtual backgrounds — bright and dark — for modern professional video calls" imageSrc={`${CDN}/wall-shelves-bright/wall-shelves-bright-16.webp`} imageAlt="Wall shelf background for video calls" navigate={navigate} count={CATEGORIES['wall-shelves'].count} />
      <Card href="/category/office-spaces" title="Office Spaces" description="Modern office settings that convey professionalism and focus" imageSrc={`${CDN}/office-spaces/office-spaces-69.webp`} imageAlt="Professional office space background for business calls" navigate={navigate} count={CATEGORIES['office-spaces'].count} />
      <Card href="/category/home-office" title="Home Offices" description="Warm, personal home office backgrounds for work-from-home calls" imageSrc={`${CDN}/home-office/home-offices-74.webp`} imageAlt="Cozy home office background for remote work video calls" navigate={navigate} count={CATEGORIES['home-office'].count} />
      <Card href="/category/living-rooms" title="Living Rooms" description="Comfortable home settings that feel welcoming and professional" imageSrc={`${CDN}/living-rooms/living-room-12.webp`} imageAlt="Comfortable living room backgrounds" navigate={navigate} count={CATEGORIES['living-rooms'].count} />
      <Card href="/category/kitchens" title="Kitchen Backgrounds" description="Warm kitchen spaces that create a friendly, approachable atmosphere" imageSrc={`${CDN}/kitchens/kitchen-09.webp`} imageAlt="Kitchen virtual background" navigate={navigate} count={CATEGORIES['kitchens'].count} />
      <Card href="/category/coffee-shops" title="Coffee Shops" description="Cozy coffee shop backgrounds for casual meetings" imageSrc={`${CDN}/coffee-shops/coffee-shop-12.webp`} imageAlt="Coffee shop virtual background" navigate={navigate} count={CATEGORIES['coffee-shops'].count} />
      <Card href="/category/art-galleries" title="Art Galleries" description="Sophisticated art gallery spaces with clean walls" imageSrc={`${CDN}/art-galleries/art-gallery-26.webp`} imageAlt="Art gallery virtual background" navigate={navigate} count={CATEGORIES['art-galleries'].count} />
      <Card href="/category/urban-lofts" title="Urban Lofts" description="Modern industrial loft spaces with exposed brick" imageSrc={`${CDN}/urban-lofts/urban-loft-20.webp`} imageAlt="Urban loft virtual background" navigate={navigate} count={CATEGORIES['urban-lofts'].count} />
      <Card href="/category/gardens-patios" title="Gardens & Patios" description="Beautiful outdoor garden and patio backgrounds" imageSrc={`${CDN}/gardens-patios/garden-patio-14.webp`} imageAlt="Garden and patio virtual background" navigate={navigate} count={CATEGORIES['gardens-patios'].count} />
      <Card href="/category/historic-spaces" title="Historic Spaces" description="Elegant historic interiors including ballrooms" imageSrc={`${CDN}/historic-spaces/historic-space-33.webp`} imageAlt="Historic space virtual background" navigate={navigate} count={CATEGORIES['historic-spaces'].count} />
      <Card href="/category/nature-landscapes" title="Nature & Landscapes" description="Stunning natural landscapes and scenic outdoor views for nature-inspired calls" imageSrc={`${CDN}/nature-landscapes/nature-landscape-46.webp`} imageAlt="Nature landscape virtual background" navigate={navigate} count={CATEGORIES['nature-landscapes'].count} />
      <Card href="/category/libraries" title="Libraries" description="Classic library rooms with floor-to-ceiling books" imageSrc={`${CDN}/libraries/library-17.webp`} imageAlt="Library virtual background" navigate={navigate} count={CATEGORIES['libraries'].count} />
      <Card href="/category/bokeh-backgrounds" title="Bokeh Backgrounds" description="Beautiful bokeh light effects with artistic blur for elegant calls" imageSrc={`${CDN}/bokeh-backgrounds/bokeh-13.webp`} imageAlt="Bokeh virtual background" navigate={navigate} count={CATEGORIES['bokeh-backgrounds'].count} />
      <Card href="/category/summer-backgrounds" title="Summer Backgrounds" description="Bright coastal and outdoor summer backgrounds — beaches, patios & sun-drenched settings for video calls" imageSrc={`${CDN}/summer-backgrounds/serene-tropical-beach-view-turquoise-waters-white-sand-palm-382c1cb1.webp`} imageAlt="Summer virtual background for video calls" navigate={navigate} count={CATEGORIES['summer-backgrounds'].count} />
    </div>
  );
}
