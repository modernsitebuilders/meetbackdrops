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
    { id: 'bookshelves-bright-07-hd', name: 'Bright Bookshelf #7', category: 'bookshelves-bright', gumroadUrl: 'https://streambackdrops.gumroad.com/l/tbxrpv' },
    { id: 'bookshelves-bright-10-hd', name: 'Bright Bookshelf #10', category: 'bookshelves-bright', gumroadUrl: 'https://streambackdrops.gumroad.com/l/jcvena' },
    
    // Bookshelves Dark
    { id: 'bookshelves-dark-02-hd', name: 'Dark Bookshelf #2', category: 'bookshelves-dark', gumroadUrl: 'https://streambackdrops.gumroad.com/l/nbihuj' },
    { id: 'bookshelves-dark-07-hd', name: 'Dark Bookshelf #7', category: 'bookshelves-dark', gumroadUrl: 'https://streambackdrops.gumroad.com/l/aawpjt' },
    { id: 'bookshelves-dark-09-hd', name: 'Dark Bookshelf #9', category: 'bookshelves-dark', gumroadUrl: 'https://streambackdrops.gumroad.com/l/fctjna' },
    
    // Wall Shelves Bright
    { id: 'wall-shelves-bright-28-hd', name: 'Bright Wall Shelf #28', category: 'wall-shelves-bright', gumroadUrl: 'https://streambackdrops.gumroad.com/l/wgvkzz' },
    
    // Office Spaces
    { id: 'office-spaces-02-hd', name: 'Office Space #2', category: 'office-spaces', gumroadUrl: 'https://streambackdrops.gumroad.com/l/wdbxsp' },
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
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Premium HD Virtual Backgrounds | StreamBackdrops" />
        <meta property="og:description" content="Professional HD virtual backgrounds in 2912×1632 resolution. 2x sharper than standard backgrounds." />
        <meta property="og:image" content="https://res.cloudinary.com/dnhju6mhg/image/upload/streambackdrops/bookshelves-dark/bookshelves-dark-09-hd.png" />
        <meta property="og:url" content="https://streambackdrops.com/hd" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Premium HD Virtual Backgrounds" />
        <meta name="twitter:description" content="Professional HD backgrounds in 2912×1632 resolution" />
        <meta name="twitter:image" content="https://res.cloudinary.com/dnhju6mhg/image/upload/streambackdrops/bookshelves-dark/bookshelves-dark-09-hd.png" />
      </Head>

      {/* Compact Hero Section */}
      <section style={{ 
        padding: '2rem 2rem 3rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>Premium HD Backgrounds</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.95 }}>
          2912×1632 resolution - 2x the detail of standard backgrounds
        </p>
        
        {/* Enhanced Comparison Widget Button */}
        <ComparisonWidget />
      </section>

      {/* Products Grid */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {products.map(product => (
            <div key={product.id} style={{
              border: '3px solid gold',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <img 
  src={`/images/${product.category}/${product.id.replace('-hd', '')}.webp`}
  alt={`${product.name} - Premium HD Virtual Background`}
  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
/>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{product.name}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Premium HD - 2912×1632
                </p>
                <a 
  href={product.gumroadUrl}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => {
    // GA4 tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'HD Product Click',
        event_label: product.name,
        value: 4.99
      });
    }
    
    // Google Sheets tracking
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'gumroad_click',
        filename: product.id,
        category: 'hd',
        originalSource: document.referrer || 'direct'
      })
    }).catch(() => {});
  }}
  style={{
    display: 'block',
    background: '#2563eb',
    color: 'white',
    padding: '0.75rem',
    borderRadius: '8px',
    textAlign: 'center',
    textDecoration: 'none',
    fontWeight: 'bold'
  }}
>
  Get HD - $4.99
</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}