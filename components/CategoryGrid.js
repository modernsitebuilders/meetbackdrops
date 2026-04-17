import Card from './Card';
import { CATEGORIES } from '../lib/categories-config';
import styles from '../styles/HomePage.module.css';

const CDN = 'https://assets.streambackdrops.com/webp';

export default function CategoryGrid({ navigate }) {
  return (
    <div id="categories" className={`${styles.categoryGrid} category-grid`}>
      <Card href="/category/bookshelves" title="Bookshelves" description="Professional bookshelf virtual backgrounds — bright and dark lighting — for video calls and presentations" imageSrc={`${CDN}/bookshelves-bright/bookshelves-bright-42.webp`} imageAlt="Bookshelf background for video calls" navigate={navigate} priority={false} count={CATEGORIES['bookshelves'].count} />
      <Card href="/category/wall-shelves" title="Wall Shelves" description="Clean, minimalist wall shelf virtual backgrounds — bright and dark — for modern professional video calls" imageSrc={`${CDN}/wall-shelves-bright/wall-shelves-bright-54.webp`} imageAlt="Wall shelf background for video calls" navigate={navigate} count={CATEGORIES['wall-shelves'].count} />
      <Card href="/category/office-spaces" title="Office Spaces" description="Modern office settings that convey professionalism and focus" imageSrc={`${CDN}/office-spaces/office-spaces-69.webp`} imageAlt="Professional office space background for business calls" navigate={navigate} count={CATEGORIES['office-spaces'].count} />
      <Card href="/category/home-office" title="Home Offices" description="Warm, personal home office backgrounds for work-from-home calls" imageSrc={`${CDN}/home-office/home-offices-29.webp`} imageAlt="Cozy home office background for remote work video calls" navigate={navigate} count={CATEGORIES['home-office'].count} />
      <Card href="/category/living-rooms" title="Living Rooms" description="Comfortable home settings that feel welcoming and professional" imageSrc={`${CDN}/living-rooms/living-room-12.webp`} imageAlt="Comfortable living room backgrounds" navigate={navigate} count={CATEGORIES['living-rooms'].count} />
      <Card href="/category/kitchens" title="Kitchen Backgrounds" description="Warm kitchen spaces that create a friendly, approachable atmosphere" imageSrc={`${CDN}/kitchens/kitchen-09.webp`} imageAlt="Kitchen virtual background" navigate={navigate} count={CATEGORIES['kitchens'].count} />
      <Card href="/category/coffee-shops" title="Coffee Shops" description="Cozy coffee shop backgrounds for casual meetings" imageSrc={`${CDN}/coffee-shops/coffee-shop-10.webp`} imageAlt="Coffee shop virtual background" navigate={navigate} count={CATEGORIES['coffee-shops'].count} />
      <Card href="/category/art-galleries" title="Art Galleries" description="Sophisticated art gallery spaces with clean walls" imageSrc={`${CDN}/art-galleries/art-gallery-18.webp`} imageAlt="Art gallery virtual background" navigate={navigate} count={CATEGORIES['art-galleries'].count} />
      <Card href="/category/urban-lofts" title="Urban Lofts" description="Modern industrial loft spaces with exposed brick" imageSrc={`${CDN}/urban-lofts/urban-loft-01.webp`} imageAlt="Urban loft virtual background" navigate={navigate} count={CATEGORIES['urban-lofts'].count} />
      <Card href="/category/gardens-patios" title="Gardens & Patios" description="Beautiful outdoor garden and patio backgrounds" imageSrc={`${CDN}/gardens-patios/garden-patio-01.webp`} imageAlt="Garden and patio virtual background" navigate={navigate} count={CATEGORIES['gardens-patios'].count} />
      <Card href="/category/historic-spaces" title="Historic Spaces" description="Elegant historic interiors including ballrooms" imageSrc={`${CDN}/historic-spaces/historic-space-06.webp`} imageAlt="Historic space virtual background" navigate={navigate} count={CATEGORIES['historic-spaces'].count} />
      <Card href="/category/nature-landscapes" title="Nature & Landscapes" description="Stunning natural landscapes and scenic outdoor views for nature-inspired calls" imageSrc={`${CDN}/nature-landscapes/nature-landscape-1.webp`} imageAlt="Nature landscape virtual background" navigate={navigate} count={CATEGORIES['nature-landscapes'].count} />
      <Card href="/category/libraries" title="Libraries" description="Classic library rooms with floor-to-ceiling books" imageSrc={`${CDN}/libraries/library-03.webp`} imageAlt="Library virtual background" navigate={navigate} count={CATEGORIES['libraries'].count} />
      <Card href="/category/conference-rooms" title="Conference Rooms" description="Professional conference room backgrounds for team meetings" imageSrc={`${CDN}/conference-rooms/conference-room-01.webp`} imageAlt="Conference room virtual background" navigate={navigate} count={CATEGORIES['conference-rooms'].count} />
      <Card href="/category/bokeh-backgrounds" title="Bokeh Backgrounds" description="Beautiful bokeh light effects with artistic blur for elegant calls" imageSrc={`${CDN}/bokeh-backgrounds/bokeh-56.webp`} imageAlt="Bokeh virtual background" navigate={navigate} count={CATEGORIES['bokeh-backgrounds'].count} />
      <Card href="/category/easter-backgrounds" title="Easter Backgrounds" description="Bright spring pastel backgrounds with Easter eggs, bunnies & seasonal charm" imageSrc={`${CDN}/easter-backgrounds/easter-background-03.webp`} imageAlt="Easter virtual background for video calls" navigate={navigate} count={CATEGORIES['easter-backgrounds'].count} />
      <Card href="/category/spring-backgrounds" title="Spring Backgrounds" description="Fresh spring backgrounds with blooming flowers, sunrooms & outdoor seasonal scenery" imageSrc={`${CDN}/spring-backgrounds/spring-background-01.webp`} imageAlt="Spring virtual background for video calls" navigate={navigate} count={CATEGORIES['spring-backgrounds'].count} />
    </div>
  );
}
