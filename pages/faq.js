import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';



export default function FAQ() {

  const faqs = [
    {
      question: "How do I use these backgrounds in Zoom, Teams, or Google Meet?",
      answer: "Download the background image you like, then go to your video platform's settings. In Zoom: Settings → Background & Effects → Virtual Backgrounds → + button. In Microsoft Teams: Settings → Devices → Background effects → Add new → Upload. In Google Meet: Click the three dots → Apply visual effects → Background blur → Upload background."
    },
    {
      question: "What resolution/size are the backgrounds?",
      answer: "All backgrounds are 1456 x 816 pixels in PNG format, which works perfectly for most video conferencing platforms. The file sizes are approximately 1-2 MB each."
    },
    {
      question: "Are these backgrounds free to use?",
      answer: "Yes! All backgrounds on StreamBackdrops are completely free to download and use for personal purposes."
    },
    {
      question: "Do I need to give credit or attribution?",
      answer: "No attribution is required, though we always appreciate it if you want to share where you found your background! You're free to use them without crediting us."
    },
    {
      question: "What file format are the backgrounds?",
      answer: "All backgrounds are provided in PNG format, which offers high quality and works with all major video conferencing platforms."
    },
    {
      question: "Will these work on my device/platform?",
      answer: "Yes! Our PNG backgrounds are compatible with all devices and platforms including Mac, Windows, Chromebook, iPad, and work with Zoom, Microsoft Teams, Google Meet, Skype, Discord, OBS, StreamYard, and virtually any platform that supports virtual backgrounds."
    },
    {
      question: "How do I download a background?",
      answer: "Browse our categories, click on the background you like, and click the download button. The image will save to your device's downloads folder. Then upload it to your video platform of choice."
    },
    {
      question: "Can I request custom backgrounds?",
      answer: "We're currently focused on expanding our existing collection. If you have suggestions for new categories or themes, please reach out through our contact page and we'll consider them for future additions!"
    },
    {
      question: "How often do you add new backgrounds?",
      answer: "We regularly add new backgrounds and seasonal collections. Currently we have Halloween backgrounds available, and we'll be adding Christmas backgrounds in November. Follow us or check back often for new additions!"
    },
    {
      question: "Can I edit or modify the backgrounds?",
      answer: "Yes! Feel free to edit, crop, or modify our backgrounds however you like to suit your needs."
    },
    {
      question: "Why should I use a virtual background?",
      answer: "Virtual backgrounds help maintain privacy, hide messy rooms, create a professional appearance for work calls, add personality to streams, and ensure consistent branding for business communications."
    }
  ];


  return (
  <Layout
    title="Frequently Asked Questions - StreamBackdrops"
    description="Get answers to common questions about using free virtual backgrounds for Zoom, Teams, and Google Meet."
    canonical="https://streambackdrops.com/faq"
  >
    <div style={{ 
      background: '#f8fafc', 
      minHeight: '100vh',
      paddingLeft: '2rem',
      paddingRight: '2rem'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '2rem 0'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '3rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          
          {/* Header Section - ADD THIS */}
          <div style={{textAlign: 'center', marginBottom: '3rem'}}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Frequently Asked Questions
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '1.1rem'
            }}>
              Everything you need to know about StreamBackdrops
            </p>
          </div>

          {/* FAQ List - WRAP YOUR EXISTING FAQ MAP */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            {faqs.map((faq, index) => (
              <div key={index} style={{
                background: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <h2 style={{
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.75rem',
                  fontSize: '1.1rem'
                }}>
                  {faq.question}
                </h2>
                <p style={{color: '#6b7280', lineHeight: '1.7'}}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA - ADD THIS */}
          <div style={{
            marginTop: '3rem',
            background: '#eff6ff',
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1e40af',
              marginBottom: '1rem'
            }}>
              Still have questions?
            </h2>
            <p style={{color: '#1e40af', marginBottom: '1.5rem'}}>
              Can't find the answer you're looking for? We'd love to hear from you.
            </p>
            <Link href="/contact" style={{
              background: '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              Contact Us
            </Link>
          </div>

        </div>
      </div>
    </div>
  </Layout>
);
}