import Link from 'next/link';

export const videoCallEtiquetteContent = () => {
  return (
    <article style={{ 
      background: '#f8fafc', 
      minHeight: '100vh'
    }}>
      
      {/* PADDING WRAPPER */}
      <div style={{
        paddingLeft: '2rem',
        paddingRight: '2rem'
      }}>
        
        {/* MAX-WIDTH CONTAINER */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          paddingTop: '2rem', 
          paddingBottom: '2rem' 
        }}>
          
          {/* WHITE CARD WRAPPER */}
          <div style={{ 
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            
            {/* HERO/HEADER SECTION */}
            <header style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
                opacity: '0.9'
              }}>
                Professional Communication Guide
              </div>
              
              <h1 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 'bold',
                marginBottom: '1rem',
                lineHeight: '1.2'
              }}>
                Video Call Etiquette: Professional Guide for Virtual Meetings
              </h1>
              
              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                opacity: '0.95',
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                Master professional behavior for successful video conferences
              </p>
            </header>

            {/* ARTICLE CONTENT SECTION */}
            <div style={{
              padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.75'
            }}>

              <p style={{fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem'}}>
                Video calls have become the standard for professional communication, but many people still struggle with proper etiquette. Following these guidelines will ensure you make a professional impression in every virtual meeting.
              </p>

              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Before the Call: Preparation Matters
              </h2>

              <div style={{
                background: '#eff6ff',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem'}}>
                  Technical Setup Checklist
                </h3>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#1e40af'}}>
                  <li>Test your camera, microphone, and speakers 15 minutes before</li>
                  <li>Ensure stable internet connection</li>
                  <li>Close unnecessary applications and browser tabs</li>
                  <li>Charge your laptop or have power cable ready</li>
                  <li>Have the meeting link readily accessible</li>
                </ul>
              </div>

              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Professional Appearance & Environment
              </h3>

              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                Dress Appropriately
              </h3>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                Dress as you would for an in-person meeting. Business casual is usually appropriate, but consider your industry and the meeting's formality. Avoid distracting patterns or logos.
              </p>

              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                Set Your Scene
              </h3>
              <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                <li>Choose a clean, professional background</li>
                <li>Ensure good lighting facing you</li>
                <li>Position camera at eye level</li>
                <li>Remove personal or distracting items from view</li>
                <li>Inform household members about your meeting</li>
              </ul>

              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                During the Call: Professional Conduct
              </h2>

              <div style={{
                background: '#f0fdf4',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#065f46', marginBottom: '0.75rem'}}>
                  Join On Time
                </h3>
                <p style={{color: '#065f46'}}>
                  Join the meeting 1-2 minutes early. If you're running late, send a quick message to the host. Never join more than 5 minutes early without permission.
                </p>
              </div>

              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                Mute Yourself When Not Speaking
              </h3>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                Background noise is distracting. Keep yourself muted until it's your turn to speak. Learn your platform's mute shortcut key for quick toggling.
              </p>

              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                Maintain Eye Contact
              </h3>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                Look at the camera when speaking to create the illusion of eye contact. Avoid staring at your own video or other participants' videos constantly.
              </p>

              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                Use Video Appropriately
              </h3>
              <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                <li>Keep your video on for most professional meetings</li>
                <li>Turn off video if your connection is unstable</li>
                <li>Use virtual backgrounds professionally if needed</li>
                <li>Avoid excessive movement or fidgeting</li>
              </ul>

              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Communication Best Practices
              </h2>

              <div style={{
                background: '#fef3c7',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#92400e', marginBottom: '0.75rem'}}>
                  Speak Clearly and Concisely
                </h3>
                <p style={{color: '#92400e'}}>
                  Wait for others to finish speaking before you begin. Speak clearly and at a moderate pace. Use the "raise hand" feature in larger meetings.
                </p>
              </div>

              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                Use Chat Features Professionally
              </h3>
              <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                <li>Use chat for relevant links or quick questions</li>
                <li>Avoid side conversations in chat during presentations</li>
                <li>Don't spam the chat with unnecessary messages</li>
                <li>Use private messages only when appropriate</li>
              </ul>

              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                Be Present and Engaged
              </h3>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                Avoid multitasking during meetings. Don't check email, browse the web, or work on other tasks. Your engagement (or lack thereof) is often visible to others.
              </p>

              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Common Etiquette Mistakes to Avoid
              </h2>

              <div style={{
                background: '#fef2f2',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#dc2626', marginBottom: '0.75rem'}}>
                  ❌ Never Do These
                </h3>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#dc2626'}}>
                  <li>Eat during the meeting (small sips of water are fine)</li>
                  <li>Take phone calls or have side conversations</li>
                  <li>Leave without explanation</li>
                  <li>Interrupt other speakers</li>
                  <li>Use inappropriate virtual backgrounds</li>
                  <li>Have distracting notifications enabled</li>
                </ul>
              </div>

              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Ending the Call Gracefully
              </h2>

              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                Proper Goodbyes
              </h3>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                Wait for the host to officially end the meeting. Say goodbye to the group rather than just disappearing. Thank the host and participants for their time.
              </p>

              <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                Follow Up
              </h3>
              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                Send any promised follow-up materials promptly. If you took notes, share relevant action items with the team.
              </p>

              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Platform-Specific Etiquette
              </h2>

              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem'}}>
                <div style={{
                  borderLeft: '4px solid #2563eb',
                  paddingLeft: '1rem',
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '0 0.5rem 0.5rem 0'
                }}>
                  <h4 style={{fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem'}}>Zoom</h4>
                  <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280'}}>
                    <li>Use "raise hand" feature in large meetings</li>
                    <li>Rename yourself with your full name and company</li>
                    <li>Use reactions sparingly and appropriately</li>
                  </ul>
                </div>

                <div style={{
                  borderLeft: '4px solid #7c3aed',
                  paddingLeft: '1rem',
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '0 0.5rem 0.5rem 0'
                }}>
                  <h4 style={{fontWeight: '600', color: '#581c87', marginBottom: '0.5rem'}}>Microsoft Teams</h4>
                  <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280'}}>
                    <li>Use Together Mode for more engaging meetings</li>
                    <li>Utilize the "raise hand" in the reactions panel</li>
                    <li>Share files through Teams chat when relevant</li>
                  </ul>
                </div>

                <div style={{
                  borderLeft: '4px solid #059669',
                  paddingLeft: '1rem',
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '0 0.5rem 0.5rem 0'
                }}>
                  <h4 style={{fontWeight: '600', color: '#065f46', marginBottom: '0.5rem'}}>Google Meet</h4>
                  <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280'}}>
                    <li>Use captions if needed for clarity</li>
                    <li>Utilize the hand raise feature</li>
                    <li>Share your screen only when presenting</li>
                  </ul>
                </div>
              </div>

              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Quick Etiquette Checklist
              </h2>

              <div style={{
                background: '#f8fafc',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{fontWeight: '600', color: '#111827', marginBottom: '1rem'}}>Before Every Video Call:</h3>
                <ul style={{listStyle: 'none', color: '#6b7280'}}>
                  <li>☐ Test audio and video equipment</li>
                  <li>☐ Choose professional background and lighting</li>
                  <li>☐ Dress appropriately for the meeting</li>
                  <li>☐ Close distracting applications</li>
                  <li>☐ Have meeting materials ready</li>
                  <li>☐ Join 1-2 minutes early</li>
                </ul>
              </div>

              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                Conclusion
              </h2>

              <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                Good video call etiquette demonstrates professionalism and respect for others' time. By following these guidelines, you'll build stronger professional relationships and make more effective use of virtual meeting time.
              </p>

              <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                Remember that virtual communication requires extra attention to detail since you lose many of the nonverbal cues available in person. Your video call behavior directly impacts how colleagues and clients perceive your professionalism.
              </p>

              <div style={{
                background: '#eff6ff',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginTop: '2rem'
              }}>
                <p style={{color: '#1e40af', fontWeight: '500', marginBottom: '1rem'}}>
                  Complete your professional setup with our free virtual backgrounds designed specifically for business meetings.
                </p>
                <Link href="/" style={{
                  background: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'background-color 0.2s'
                }}>
                  Browse Professional Backgrounds →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};