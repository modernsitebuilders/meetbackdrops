// components/NewsletterSignup.js
import { useState } from 'react';
import styles from '../styles/Newsletter.module.css';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Get New Backgrounds First</h3>
      <p className={styles.description}>
        Join 5,000+ professionals getting our latest backgrounds and video call tips
      </p>
      
      {status === 'success' ? (
        <p className={styles.success}>✓ Thanks! Check your email to confirm.</p>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            disabled={status === 'loading'}
          />
          <button 
            type="submit" 
            className={styles.button}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}
      
      {status === 'error' && (
        <p className={styles.error}>Something went wrong. Please try again.</p>
      )}
    </div>
  );
}