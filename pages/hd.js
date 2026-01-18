import Head from 'next/head';
import BreadcrumbSchema from '../components/BreadcrumbSchema';
import ComparisonWidgetSchema from '../components/ComparisonWidgetSchema';
import ProductSchema from '../components/ProductSchema';
import { useState } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import ComparisonWidget from '../components/ComparisonWidget';

export default function Premium() {
  const products = [
    // Bookshelves Bright
    { id: 'bookshelves-bright-01-hd', name: 'Bright Bookshelf #1', category: 'bookshelves-bright', gumroadUrl: 'https://streambackdrops.gumroad.com/l/mbgeii' },
    { id: 'bookshelves-bright-04-hd', name: 'Bright Bookshelf #4', category: 'bookshelves-bright', gumroadUrl: 'https://streambackdrops.gumroad.com/l/wxdblc' },
    { id: 'bookshelves-bright-06-hd', name: 'Bright Bookshelf #6', category: 'bookshelves-bright', gumroadUrl: 'https://streambackdrops.gumroad.com/l/utjzej' },
    { id: 'bookshelves-bright-07-hd', name: 'Bright Bookshelf #7', category: 'bookshelves-bright', gumroadUrl: 'https://streambackdrops.gumroad.com/l/tbxrpv' },
    { id: 'bookshelves-bright-10-hd', name: 'Bright Bookshelf #10', category: 'bookshelves-bright', gumroadUrl: 'https://streambackdrops.gumroad.com/l/jcvena' },
    { id: 'bookshelves-bright-23-hd', name: 'Bright Bookshelf #23', category: 'bookshelves-bright', gumroadUrl: 'https://streambackdrops.gumroad.com/l/nclaj' },
    
    // Bookshelves Dark
    { id: 'bookshelves-dark-02-hd', name: 'Dark Bookshelf #2', category: 'bookshelves-dark', gumroadUrl: 'https://streambackdrops.gumroad.com/l/nbihuj' },
    { id: 'bookshelves-dark-07-hd', name: 'Dark Bookshelf #7', category: 'bookshelves-dark', gumroadUrl: 'https://streambackdrops.gumroad.com/l/aawpjt' },
    { id: 'bookshelves-dark-09-hd', name: 'Dark Bookshelf #9', category: 'bookshelves-dark', gumroadUrl: 'https://streambackdrops.gumroad.com/l/fctjna' },
    
    // Wall Shelves Bright
    { id: 'wall-shelves-bright-28-hd', name: 'Bright Wall Shelf #28', category: 'wall-shelves-bright', gumroadUrl: 'https://streambackdrops.gumroad.com/l/wgvkzz' },
    
    // Coffee Shops
    { id: 'coffee-shop-03-hd', name: 'Coffee Shop #3', category: 'coffee-shops', gumroadUrl: 'https://streambackdrops.gumroad.com/l/skkti' },
    
    // Libraries
    { id: 'library-17-hd', name: 'Library #17', category: 'libraries', gumroadUrl: 'https://streambackdrops.gumroad.com/l/hbgxla' },
    
    // Office Spaces
    { id: 'office-spaces-01-hd', name: 'Office Space #1', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/pqhzew' },
    { id: 'office-spaces-02-hd', name: 'Office Space #2', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/wdbxsp' },
    { id: 'office-spaces-03-hd', name: 'Office Space #3', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/qywfkn' },
    { id: 'office-spaces-05-hd', name: 'Office Space #5', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/itxqid' },
    { id: 'office-spaces-06-hd', name: 'Office Space #6', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/xjjrys' },
    { id: 'office-spaces-07-hd', name: 'Office Space #7', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/urlomh' },
    { id: 'office-spaces-08-hd', name: 'Office Space #8', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/mtwgv' },
    { id: 'office-spaces-17-hd', name: 'Office Space #17', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/gehtyw' },
    { id: 'office-spaces-19-hd', name: 'Office Space #19', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/gifhpc' },
    { id: 'office-spaces-24-hd', name: 'Office Space #24', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/umtpss' },
    { id: 'office-spaces-33-hd', name: 'Office Space #33', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/qjfisu' },
    { id: 'office-spaces-36-hd', name: 'Office Space #36', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/jbxnc' },
    { id: 'office-spaces-43-hd', name: 'Office Space #43', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/tnfexs' },
    { id: 'office-spaces-77-hd', name: 'Office Space #77', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/ttxxm' },
    
    // Nature Landscapes
    { id: 'nature-landscapes-11-hd', name: 'Nature Landscape #11', category: 'nature-landscapes', gumroadUrl: 'https://streambackdrops.gumroad.com/l/mcesv' },
    { id: 'nature-landscapes-20-hd', name: 'Nature Landscape #20', category: 'nature-landscapes', gumroadUrl: 'https://streambackdrops.gumroad.com/l/xtqdg' },
    { id: 'nature-landscapes-21-hd', name: 'Nature Landscape #21', category: 'nature-landscapes', gumroadUrl: 'https://streambackdrops.gumroad.com/l/jwrqe' },
    { id: 'nature-landscapes-30-hd', name: 'Nature Landscape #30', category: 'nature-landscapes', gumroadUrl: 'https://streambackdrops.gumroad.com/l/sbyvpc' },
    { id: 'nature-landscapes-46-hd', name: 'Nature Landscape #46', category: 'nature-landscapes', gumroadUrl: 'https://streambackdrops.gumroad.com/l/gmcdi' },
  ];

  const [selected, setSelected] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const toggleSelect = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const getPrice = () => {
    if (selected.length === 0) return null;
    if (selected.length === 1) return 4.99;
    if (selected.length === 2) return 6.99;
    return 8.99;
  };

  return (
    <Layout 
      title="Premium HD Virtual Backgrounds | 2912×1632 Resolution | StreamBackdrops"
      description="Professional HD virtual backgrounds in stunning 2912×1632 resolution. Perfect for Zoom, Teams, and Google Meet. 2x sharper than standard backgrounds."
      canonical="https://streambackdrops.com/hd"
      keywords="HD virtual backgrounds, high resolution backgrounds, 4K backgrounds, premium zoom backgrounds, professional video call backgrounds"
      image="https://res.cloudinary.com/dnhju6mhg/image/upload/streambackdrops/bookshelves-dark/bookshelves-dark-09-hd.png"
    >
      <Head>
        <BreadcrumbSchema items={[
          { name: "Home", url: "https://streambackdrops.com" },
          { name: "Premium HD Backgrounds", url: "https://streambackdrops.com/hd" }
        ]} />
        <ProductSchema products={products} />
        <ComparisonWidgetSchema />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Premium HD Virtual Backgrounds | StreamBackdrops" />
        <meta property="og:description" content="Professional HD virtual backgrounds in 2912×1632 resolution. 2x sharper than standard backgrounds." />
        <meta property="og:image" content="https://res.cloudinary.com/dnhju6mhg/image/upload/streambackdrops/bookshelves-dark/bookshelves-dark-09-hd.png" />
        <meta property="og:url" content="https://streambackdrops.com/hd" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Premium HD Virtual Backgrounds" />
        <meta name="twitter:description" content="Professional HD backgrounds in 2912×1632 resolution" />
        <meta name="twitter:image" content="https://res.cloudinary.com/dnhju6mhg/image/upload/streambackdrops/bookshelves-dark/bookshelves-dark-09-hd.png" />
      </Head>

      <section style={{ 
        padding: '2rem 2rem 3rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>Premium HD Backgrounds</h1>
        <div style={{ 
          background: 'rgba(255,255,255,0.2)', 
          padding: '1rem', 
          borderRadius: '8px',
          display: 'inline-block',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            1 image: $4.99 • 2 images: $6.99 • 3 images: $8.99
          </div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {selected.length === 3 
              ? '✓ Max 3 images selected - Ready to checkout!' 
              : 'Click images to select, then checkout'}
          </div>
        </div>
        
      </section>

      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {products.map(product => (
            <div key={product.id} style={{
              border: selected.includes(product.id) ? '3px solid #2563eb' : '3px solid gold',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              position: 'relative',
              cursor: 'pointer'
            }} onClick={() => toggleSelect(product.id)}>
              
              {selected.includes(product.id) && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#2563eb',
                  color: 'white',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  zIndex: 1
                }}>✓</div>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage({
                    standard: `/images/${product.category}/${product.id.replace('-hd', '')}.webp`,
                    hd: `https://res.cloudinary.com/dnhju6mhg/image/upload/streambackdrops/${product.category}/${product.id}.png`
                  });
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  zIndex: 2,
                  fontWeight: 'bold'
                }}
                className="preview-btn"
              >
                👁️ Preview HD
              </button>
              
              <img 
                src={`/images/${product.category}/${product.id.replace('-hd', '')}.webp`}
                alt={`${product.name} - Premium HD Virtual Background`}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{product.name}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Premium HD - 2912×1632
                </p>
              </div>
            </div>
          ))}
        </div>

        {selected.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: '#2563eb',
            color: 'white',
            padding: '1.5rem 2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 100
          }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelected([]);
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0.25rem'
              }}
              title="Clear selection"
            >×</button>
            
            <div style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              {selected.length} image{selected.length > 1 ? 's' : ''} selected
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              ${getPrice()}
            </div>
            <button style={{
              background: 'white',
              color: '#2563eb',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              fontSize: '1rem'
            }} onClick={(e) => {
              e.stopPropagation();
              alert('Next: Set up Gumroad bundle products for 2/$6.99 and 3/$8.99');
            }}>
              Checkout
            </button>
          </div>
        )}
      </section>

      <ComparisonWidget
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        standardImg={previewImage?.standard}
        hdImg={previewImage?.hd}
      />

      <style jsx>{`
        .preview-btn {
          opacity: 0;
        }
        div:hover .preview-btn {
          opacity: 1 !important;
        }
      `}</style>
    </Layout>
  );
}