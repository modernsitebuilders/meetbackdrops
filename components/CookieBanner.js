// components/CookieBanner.js
import CookieConsent from "react-cookie-consent";

export default function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept"
      declineButtonText="Decline"
      cookieName="userConsent"
      style={{ background: "#2B373B" }}
      buttonStyle={{ background: "#2563EB", color: "white", fontSize: "13px" }}
      declineButtonStyle={{ background: "#6B7280", color: "white", fontSize: "13px" }}
      expires={150}
      enableDeclineButton
      onAccept={() => {
        // Load analytics here if needed
        if (typeof window.gtag !== 'undefined') {
          window.gtag('consent', 'update', {
            'analytics_storage': 'granted'
          });
        }
      }}
    >
      This website uses cookies to enhance your experience.
    </CookieConsent>
  );
}