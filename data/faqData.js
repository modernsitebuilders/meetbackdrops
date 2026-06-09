// data/faqData.js
// Centralized FAQ data for all pages
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config.js';

export const faqData = {
  // Homepage FAQs
  homepage: [
    {
      question: "Are your virtual backgrounds really free?",
      answer: `Yes, all ${TOTAL_IMAGES_FORMATTED} virtual backgrounds on MeetBackdrops are completely free to download and use for personal and commercial purposes. No signup required, no watermarks.`
    },
    {
      question: "What video platforms work with these backgrounds?",
      answer: "Our virtual backgrounds work with Zoom, Microsoft Teams, Google Meet, Skype, Discord, and any video conferencing platform that supports custom backgrounds."
    },
    {
      question: "What format are the backgrounds?",
      answer: "All backgrounds are high-quality WEBP format images optimized for fast loading and professional video calls."
    },
    {
      question: "Do I need a green screen to use these backgrounds?",
      answer: "No green screen required! Modern video conferencing platforms like Zoom and Teams can detect your outline automatically, though a green screen can improve edge quality."
    },
    {
      question: "Can I use these backgrounds for commercial purposes?",
      answer: "Yes! All our virtual backgrounds are free for both personal and commercial use. Use them in client meetings, webinars, live streams, or any professional setting."
    }
  ],

  // Category-specific FAQs
  "bookshelves": [
    {
      question: "Are bookshelf virtual backgrounds good for professional video calls?",
      answer: "Yes — book-lined shelves are one of the most reliable signals of credibility on camera, which is why they appear behind so many lawyers, executives, and consultants. They read as intelligent and established without pulling focus from you."
    },
    {
      question: "Should I pick a bright or a dark bookshelf background?",
      answer: "Match the lighting in your room. Bright bookshelves work with cool, neutral, or daylight lighting and feel modern and approachable. Dark, wood-toned bookshelves pair with warm lighting and feel more formal and authoritative — good for evening client calls or boardroom-style meetings."
    },
    {
      question: "Will a bookshelf background work on Zoom, Teams, and Google Meet?",
      answer: "Yes. All MeetBackdrops bookshelf backgrounds are 16:9 1456×816 PNGs, which Zoom, Microsoft Teams, Google Meet, and Webex all accept as a custom background. HD editions are 2912×1632 for sharper results on 27\"+ monitors and recorded calls."
    },
    {
      question: "How do I make a bookshelf background not look fake?",
      answer: "Two things matter most: lighting and camera height. Face a window or place a lamp at eye level so your face is brighter than the background, and position your camera at eye level so you sit naturally within the scene. Both make virtual backgrounds blend convincingly."
    }
  ],

  "wall-shelves": [
    {
      question: "When should I use a wall-shelf background instead of a bookshelf?",
      answer: "Wall shelves read as cleaner and more modern than full bookcases. They're a strong choice for tech, design, real estate, and consulting calls where you want a polished, design-forward feel without the academic weight of a wall of books."
    },
    {
      question: "Are wall-shelf backgrounds appropriate for executive meetings?",
      answer: "Yes — particularly the darker, wood-toned variants. They project intentional, considered taste, which is the same signal you want for board-level and senior-stakeholder calls."
    },
    {
      question: "Do wall-shelf backgrounds work without a green screen?",
      answer: "Yes. Modern segmentation in Zoom, Teams, and Google Meet handles wall-shelf backgrounds well because the shelves create clean horizontal lines the algorithm can latch onto. A green screen sharpens the edges further but isn't required."
    }
  ],

  "home-office": [
    {
      question: "What makes a good home-office virtual background?",
      answer: "A good home-office background looks like a real workspace, not a stock photo: visible task lighting, a few personal objects, and depth behind the desk. MeetBackdrops home-office sets are designed for camera — composed to read as lived-in but not cluttered."
    },
    {
      question: "Are home-office backgrounds professional enough for client calls?",
      answer: "Yes, for most client contexts. Home-office backgrounds signal a working professional rather than a corporate office, which is now expected on Zoom and Teams calls. For very formal calls (legal, finance, executive search), an office-spaces or bookshelves background reads as more authoritative."
    },
    {
      question: "How is a home-office background different from a living-room background?",
      answer: "Home-office backgrounds include workspace cues — a desk, a chair, task lighting, sometimes books or a monitor — that anchor you as 'at work.' Living-room backgrounds feel more casual and social. Pick home-office for client/team calls, living-room for one-to-ones or social meetings."
    },
    {
      question: "Do these home-office backgrounds work for remote-work interviews?",
      answer: "Yes — and they're one of the best choices for remote interviews because they show you're set up to work from home professionally. Pair with steady lighting and you signal exactly the working environment a hiring manager wants to see."
    }
  ],

  "neutral-backgrounds": [
    {
      question: "When is a plain neutral wall background the right choice?",
      answer: "Neutral walls are the safest, most professional choice for high-stakes calls: legal depositions, executive interviews, board reports, and any context where you want zero risk of the background pulling focus. They also work well as a clean canvas behind a personal brand logo or lower-third graphic."
    },
    {
      question: "Why use a designed neutral background instead of a real blank wall?",
      answer: "Real blank walls usually have shadows, scuffs, outlets, or uneven lighting that show up on camera. Studio-designed neutral backgrounds are tuned for codec compression — even, soft, and consistent — so you get the 'clean wall' look without your real room cooperating."
    },
    {
      question: "Are neutral backgrounds good for branded video content?",
      answer: "Yes — neutral and plain-wall backgrounds are the standard for branded webinars, executive recordings, and corporate explainer videos. They keep the focus on the speaker and on-screen graphics, which is exactly what production teams ask for."
    },
    {
      question: "What color neutral background works best on camera?",
      answer: "Off-white and soft greige read as bright and modern in most lighting; deeper warm gray reads as more formal and executive. Match the warmth of your room's lighting — warm rooms pair with warmer neutrals, cool rooms with cooler off-whites — so the segmentation algorithm has less to work against."
    }
  ],

  "bookshelves-bright": [
    {
      question: "Why are bright bookshelf backgrounds popular for video calls?",
      answer: "Bright bookshelf backgrounds create a professional, well-lit appearance that suggests intelligence and credibility. They're ideal for business meetings, interviews, and presentations."
    },
    {
      question: "How do I download bright bookshelf backgrounds?",
      answer: "Simply browse our collection, click on any bright bookshelf image you like, and click the download button. All images are free to download instantly without signup."
    },
    {
      question: "What makes a good bookshelf background for Zoom?",
      answer: "The best bookshelf backgrounds have good lighting, organized shelves, and aren't too busy or distracting. Our bright bookshelf collection is specifically curated for professional video calls."
    }
  ],

  "bookshelves-dark": [
    {
      question: "When should I use dark bookshelf backgrounds?",
      answer: "Dark bookshelf backgrounds create a warm, sophisticated atmosphere perfect for evening calls, creative discussions, or when you want a more intimate, cozy professional setting."
    },
    {
      question: "Do dark backgrounds work well for video calls?",
      answer: "Yes! Dark bookshelf backgrounds work great if you have good lighting on your face. The contrast can actually make you stand out more professionally."
    },
    {
      question: "Are these dark bookshelf images high quality?",
      answer: "All our backgrounds are high quality (1456×816 or higher) and optimized specifically for video conferencing platforms like Zoom and Teams."
    }
  ],

  "office-spaces": [
    {
      question: "Why use office space virtual backgrounds?",
      answer: "Office space backgrounds convey professionalism and structure, making them perfect for client meetings, job interviews, and formal business presentations."
    },
    {
      question: "What types of office backgrounds do you offer?",
      answer: "We offer modern corporate offices, executive offices, conference rooms, and minimalist professional workspaces - all free to download."
    },
    {
      question: "Can I use office backgrounds for job interviews?",
      answer: "Absolutely! Office space backgrounds are ideal for job interviews as they project professionalism and help minimize distractions from your home environment."
    }
  ],

  "living-rooms": [
    {
      question: "Are living room backgrounds appropriate for business calls?",
      answer: "Yes! Living room backgrounds work great for less formal meetings, team calls, and situations where you want to appear approachable while still maintaining professionalism."
    },
    {
      question: "How do living room backgrounds compare to office backgrounds?",
      answer: "Living room backgrounds are more casual and warm, making colleagues and clients feel more comfortable. They're perfect for team meetings and relationship-building calls."
    },
    {
      question: "What should I look for in a living room virtual background?",
      answer: "Choose living rooms that are clean, well-organized, and not too personal. Neutral colors and simple decor work best for video calls."
    }
  ],

  "kitchens": [
    {
      question: "Can I use kitchen backgrounds for professional calls?",
      answer: "Kitchen backgrounds work well for casual meetings, cooking-related content, lifestyle brands, and any situation where you want to appear warm and approachable."
    },
    {
      question: "What types of kitchen backgrounds are available?",
      answer: "Our collection includes modern kitchens, rustic kitchens, bright cooking spaces, and cozy breakfast nooks - all optimized for video calls."
    },
    {
      question: "Are kitchen backgrounds appropriate for client meetings?",
      answer: "Kitchen backgrounds are best for informal client meetings, creative discussions, or industries where a casual, friendly atmosphere is valued."
    }
  ],

  "coffee-shops": [
    {
      question: "Why use coffee shop virtual backgrounds?",
      answer: "Coffee shop backgrounds create a casual, creative atmosphere perfect for brainstorming sessions, creative meetings, or when you want a relaxed professional vibe."
    },
    {
      question: "Do coffee shop backgrounds work for business calls?",
      answer: "Coffee shop backgrounds work great for informal business calls, creative industry meetings, and situations where you want to appear approachable and creative."
    },
    {
      question: "Are these real coffee shop photos?",
      answer: "Yes! Our coffee shop backgrounds are high-quality images of real cafe environments, optimized for video conferencing."
    }
  ],

  "art-galleries": [
    {
      question: "When should I use art gallery backgrounds?",
      answer: "Art gallery backgrounds are perfect for creative professionals, designers, artists, cultural organizations, or anyone wanting to project sophistication and creativity."
    },
    {
      question: "Do art gallery backgrounds look professional?",
      answer: "Absolutely! Art gallery backgrounds convey culture, sophistication, and attention to detail - ideal for presentations and client meetings in creative industries."
    },
    {
      question: "What's included in your art gallery collection?",
      answer: "Our collection includes modern galleries, classic museum spaces, and minimalist exhibition halls - all free to download in high quality."
    }
  ],

  "urban-lofts": [
    {
      question: "What industries are urban loft backgrounds good for?",
      answer: "Urban loft backgrounds are perfect for tech startups, creative agencies, designers, photographers, and modern professionals who want an edgy, contemporary look."
    },
    {
      question: "Do urban loft backgrounds look authentic?",
      answer: "Yes! Our urban loft collection features real industrial spaces with exposed brick, large windows, and modern design elements."
    },
    {
      question: "Are loft backgrounds too casual for business?",
      answer: "Not at all! Urban loft backgrounds strike a perfect balance between professional and creative, making them ideal for modern business environments."
    }
  ],

  "gardens-patios": [
    {
      question: "Can I use garden backgrounds for professional meetings?",
      answer: "Yes! Garden and patio backgrounds create a refreshing, peaceful atmosphere that's professional while adding natural beauty to your video calls."
    },
    {
      question: "When are garden backgrounds most appropriate?",
      answer: "Garden backgrounds work well for wellness, lifestyle, environmental, landscaping, or any industry where nature and outdoor settings align with your brand."
    },
    {
      question: "Do outdoor backgrounds work well for video calls?",
      answer: "Garden backgrounds work great for video calls as they provide visual interest without being distracting, creating a calm, professional atmosphere."
    }
  ],

  "historic-spaces": [
    {
      question: "What types of historic spaces are included?",
      answer: "Our collection includes elegant ballrooms, Art Deco corridors, historic libraries, classical interiors, and architectural landmarks."
    },
    {
      question: "Who should use historic space backgrounds?",
      answer: "Historic backgrounds are perfect for academics, historians, lawyers, consultants, or anyone wanting to project authority, tradition, and sophistication."
    },
    {
      question: "Do historic backgrounds look professional?",
      answer: "Absolutely! Historic space backgrounds convey gravitas, education, and timeless professionalism - ideal for formal presentations and distinguished meetings."
    }
  ],

  "nature-landscapes": [
    {
      question: "Are nature backgrounds appropriate for business calls?",
      answer: "Yes! Nature landscape backgrounds work well for environmental organizations, outdoor brands, wellness companies, or anyone wanting to bring calm, natural beauty to their calls."
    },
    {
      question: "What types of landscapes do you offer?",
      answer: "Our collection includes mountains, forests, deserts, coastlines, scenic vistas, and peaceful natural environments - all in high quality."
    },
    {
      question: "Can nature backgrounds be distracting?",
      answer: "Our nature backgrounds are carefully selected to be visually appealing without being distracting, creating a calm, professional atmosphere."
    }
  ],

  "libraries": [
    {
      question: "Why are library backgrounds so popular?",
      answer: "Library backgrounds suggest knowledge, education, and intellectual depth, making them perfect for educators, researchers, consultants, and any professional setting."
    },
    {
      question: "What's the difference between library and bookshelf backgrounds?",
      answer: "Library backgrounds typically show larger, more formal spaces with floor-to-ceiling books, while bookshelf backgrounds are more intimate home office settings."
    },
    {
      question: "Are library backgrounds good for teaching online?",
      answer: "Absolutely! Library backgrounds are ideal for teachers, professors, tutors, and educational content creators as they reinforce academic credibility."
    }
  ],

  "halloween-backgrounds": [
    {
      question: "Are these Halloween backgrounds free to use?",
      answer: "Yes! All 25 Halloween virtual backgrounds are completely free to download and use. No signup required, no watermarks."
    },
    {
      question: "Can I use Halloween backgrounds for work meetings?",
      answer: "Halloween backgrounds are perfect for casual team meetings, social calls, and celebrations during October. For formal client meetings, use more subtle seasonal options."
    },
    {
      question: "What platforms support Halloween virtual backgrounds?",
      answer: "These Halloween backgrounds work with Zoom, Microsoft Teams, Google Meet, Skype, Discord, and any video platform that supports custom backgrounds."
    }
  ],

  "valentines-backgrounds": [
    {
      question: "When is the right time to use a Valentine's Day virtual background?",
      answer: "Late January through February 14 is the natural window. Outside that window, hearts and pink palettes can feel out of place on a corporate call — switch back to a neutral or seasonal-appropriate backdrop afterward."
    },
    {
      question: "Are Valentine's backgrounds appropriate for client calls?",
      answer: "The subtler ones — soft pink rooms, library-with-roses scenes, romantic bokeh — work fine for client calls in early February. The overtly themed ones (lots of hearts, candy, explicit Valentine's iconography) are better kept for internal team calls and personal video chats."
    },
    {
      question: "Do these work for date-night video calls too?",
      answer: "Yes — these are popular for long-distance Valentine's calls, anniversary celebrations, and themed group hangouts. Same PNG works on Zoom, FaceTime backgrounds (where supported), Teams, and Google Meet."
    }
  ],

  "easter-backgrounds": [
    {
      question: "When should I switch to an Easter virtual background?",
      answer: "The two-week run-up to Easter Sunday is the conventional window — long enough that the seasonal cue lands, short enough that it doesn't feel premature. Spring florals work for several weeks longer if you want a softer post-Easter transition."
    },
    {
      question: "Are these Easter backgrounds appropriate for business meetings?",
      answer: "The pastel-and-spring-florals options work well across most business contexts — they read as seasonal without being overtly religious or kitsch. The explicitly Easter-themed ones (eggs, bunnies, baskets) are better suited to casual team calls, family video calls, and content for parents or educators."
    },
    {
      question: "Can teachers use these for online classes around Easter?",
      answer: "Yes — these are popular with teachers running spring-themed lessons or holiday parties for younger students. The brighter, more playful options work especially well for elementary classrooms."
    }
  ],

  "spring-backgrounds": [
    {
      question: "What makes a good spring virtual background for video calls?",
      answer: "Bright, airy, lightly floral. Spring backgrounds should signal renewal without going overboard — soft greens, fresh florals, and bright interiors all work. Avoid anything too saturated; spring reads as 'gentle and bright,' not 'loud.'"
    },
    {
      question: "Are spring backgrounds professional enough for client calls?",
      answer: "The bright-interior and soft-floral options are appropriate for almost any client context — they read as fresh and considered rather than themed. The more overtly springtime scenes (heavy florals, garden close-ups) are better for casual calls and personal video meetings."
    },
    {
      question: "When does it stop feeling weird to use a spring background?",
      answer: "Roughly March through May in the Northern Hemisphere; September through November in the Southern. Outside those windows, switch to a neutral or season-appropriate backdrop — out-of-season florals can feel jarring on a corporate call."
    },
    {
      question: "Do spring backgrounds work for Easter calls too?",
      answer: "Yes — the floral and pastel options in the spring collection double as Easter backgrounds without the overt iconography, which makes them safer for mixed business/social calls in early April."
    }
  ],

  "summer-backgrounds": [
    {
      question: "What's a good summer virtual background for a work call?",
      answer: "Bright coastal patios, sun-drenched interiors, and shaded gardens all read as summery without feeling like a vacation photo. Avoid full beach scenes for serious client calls — they're great for casual team calls but read as 'out of office' to formal stakeholders."
    },
    {
      question: "Are these appropriate for summer Friday calls and team socials?",
      answer: "Yes — the patio, beach, and outdoor-bar options in the collection are designed for exactly that. They cue 'relaxed but professional' for end-of-week team calls, summer socials, and casual brand updates."
    },
    {
      question: "Do summer backgrounds work for remote calls from a hot office?",
      answer: "There's no thermal effect, of course, but a cool blue-toned summer interior actually does help a viewer perceive a call as calmer and less harried. It's a small psychological win during heatwave-WFH stretches."
    },
    {
      question: "When does a summer background start to feel out of place?",
      answer: "Roughly June through August in the Northern Hemisphere; December through February in the Southern. By mid-September a beach scene reads as out of season — switch to autumn neutrals or a year-round professional background."
    }
  ],

  "bokeh-backgrounds": [
    {
      question: "What is a bokeh background, and when is it the right choice?",
      answer: "Bokeh is the soft, blurred light effect that high-quality lenses produce when focused on a subject. A bokeh virtual background mimics that effect — defocused warm lights or soft color gradients — keeping all visual focus on you. It's the right choice for presentations, talking-head recordings, and any call where you want zero competition for attention."
    },
    {
      question: "Are bokeh backgrounds more professional than themed ones?",
      answer: "They're more neutral. A bokeh background is the closest virtual equivalent to a professional photographer's seamless backdrop — it doesn't say anything specific, which is exactly what you want for keynotes, branded video, executive briefings, and any context where your face is the point."
    },
    {
      question: "Do bokeh backgrounds work better than blur on Zoom and Teams?",
      answer: "Yes — platform 'blur' is a real-time effect applied to your actual background, which often produces uneven edges and inconsistent quality. A bokeh image is a clean, pre-rendered scene the segmentation algorithm can sit you cleanly inside, giving sharper edges and a more cinematic look."
    },
    {
      question: "Are bokeh backgrounds good for recorded videos?",
      answer: "Yes — they're a favorite for talking-head YouTube videos, executive update recordings, and webinar intros for exactly the reasons photographers use real bokeh: it makes the subject pop without the background ever stealing focus."
    }
  ],

  // Blog pages
  blog: [
    
    {
      question: "How often do you publish new blog posts?",
      answer: "We regularly publish helpful content about virtual backgrounds, video call tips, remote work productivity, and professional video conferencing best practices."
    },
    {
      question: "Can I suggest blog topics?",
      answer: "Absolutely! We welcome topic suggestions. Contact us with ideas for content you'd like to see about virtual backgrounds and video conferencing."
    },
    {
      question: "Are your blog tips applicable to all video platforms?",
      answer: "Yes! Our blog covers universal best practices that work across Zoom, Teams, Google Meet, and other video conferencing platforms."
    }
  ],
  // Blog pages - add these after your category FAQs
"job-interview-backgrounds": [
    {
      question: "What is the best virtual background for a job interview?",
      answer: "The best virtual backgrounds for job interviews are professional office spaces, well-lit bookshelves, or clean home office settings. Choose neutral colors and avoid anything distracting or too casual."
    },
    {
      question: "Should I use a virtual background for a job interview?",
      answer: "Use a virtual background if your real background isn't professional-looking, has clutter, movement, or reveals too much personal information. A good virtual background is better than a messy real one."
    },
    {
      question: "What backgrounds should I avoid in job interviews?",
      answer: "Avoid beaches, bedrooms, memes, political imagery, blurry images, busy patterns, and anything too casual. Your background should be professional and not compete for attention with you."
    },
    {
      question: "Do hiring managers care about virtual backgrounds?",
      answer: "Yes! Hiring managers make snap judgments about professionalism based on your appearance, including your background. A professional background shows attention to detail and respect for the interview process."
    }
  ],
  "halloween-backgrounds": [
    {
      question: "Are these Halloween backgrounds free to use?",
      answer: "Yes! All 25 Halloween virtual backgrounds are completely free to download and use. No signup required, no watermarks, and free for both personal and commercial use."
    },
    {
      question: "What video platforms support Halloween virtual backgrounds?",
      answer: "These Halloween backgrounds work with Zoom, Microsoft Teams, Google Meet, Skype, Discord, and any video conferencing platform that supports custom backgrounds."
    },
    {
      question: "Can I use Halloween backgrounds for work meetings?",
      answer: "Halloween backgrounds are perfect for casual team meetings, social calls, and celebrations during October. For formal client meetings, consider more subtle seasonal options from our fall collection."
    },
    {
      question: "When should I start using Halloween backgrounds?",
      answer: "Halloween backgrounds are appropriate throughout October, with many people starting to use them in late September and continuing through Halloween on October 31st."
    }
  ],

  "best-virtual-background-sites-2026": [
    {
      question: "What's the best site for free virtual backgrounds?",
      answer: "MeetBackdrops offers 337+ free high quality virtual backgrounds specifically optimized for video calls, with no signup required and no watermarks. Unlike stock photo sites, all our backgrounds are curated for professional video conferencing."
    },
    {
      question: "Are stock photo sites good for virtual backgrounds?",
      answer: "Stock photo sites like Unsplash and Pexels have photos, but they're not optimized for video calls. MeetBackdrops images are specifically selected and formatted for video conferencing platforms."
    },
    {
      question: "Do I need to pay for quality virtual backgrounds?",
      answer: "No! MeetBackdrops provides professional-quality virtual backgrounds completely free. You don't need to pay for premium backgrounds when free, high-quality options are available."
    },
    {
      question: "How do MeetBackdrops compare to other virtual background sites?",
      answer: "MeetBackdrops focuses exclusively on video call backgrounds with curated collections, while competitors often mix in unrelated stock photos. Our backgrounds are professionally selected for video conferencing."
    }
  ],

  "video-call-etiquette": [
    {
      question: "What are the most important video call etiquette rules?",
      answer: "Key video call etiquette includes being on time, muting when not speaking, looking at the camera, dressing professionally, using appropriate backgrounds, and minimizing distractions."
    },
    {
      question: "Should I use a virtual background for professional calls?",
      answer: "Virtual backgrounds are recommended for professional calls to minimize distractions, maintain privacy, and present a polished appearance, especially when working from home."
    },
    {
      question: "Is it rude to eat during a video call?",
      answer: "Yes, eating during video calls is generally considered unprofessional unless it's a casual lunch meeting where everyone is eating. Keep your camera off if you must eat."
    },
    {
      question: "What should I avoid doing on video calls?",
      answer: "Avoid multitasking, looking at other screens, interrupting others, having messy backgrounds, poor lighting, or doing anything you wouldn't do in an in-person meeting."
    }
  ],

  "professional-video-calls": [
    {
      question: "What makes a video call look professional?",
      answer: "Professional video calls require good lighting, appropriate backgrounds, proper camera positioning at eye level, professional attire, and a quiet environment without distractions."
    },
    {
      question: "What is the best lighting for professional video calls?",
      answer: "Position yourself facing a window for natural light, or use a ring light at eye level. Avoid backlighting from windows behind you. Soft, diffused lighting from the front creates the most professional appearance."
    },
    {
      question: "How should I position my camera for video calls?",
      answer: "Place your camera at eye level, about arm's length away. Center yourself in the frame with a little headroom at the top. This creates a natural, professional perspective."
    },
    {
      question: "What makes a good professional virtual background?",
      answer: "Choose backgrounds that are professional but not distracting. Bookshelf backgrounds, office spaces, or subtle interiors work well. Avoid busy patterns, bright colors, or anything too casual for business settings."
    }
  ],

  "backgrounds-by-industry": [
    {
      question: "What virtual backgrounds should teachers use?",
      answer: "Teachers should use bright bookshelf backgrounds, library settings, or educational environments that convey knowledge and learning. Avoid distracting backgrounds that might take attention away from instruction."
    },
    {
      question: "What backgrounds are best for consultants?",
      answer: "Consultants should choose professional office spaces, executive offices, or bookshelf backgrounds that project authority and expertise. Clean, organized backgrounds work best for client meetings."
    },
    {
      question: "Can lawyers use virtual backgrounds?",
      answer: "Yes! Lawyers should use traditional settings like dark bookshelves, libraries, or formal office spaces that convey professionalism and authority appropriate for legal proceedings."
    },
    {
      question: "What backgrounds work for creative professionals?",
      answer: "Creative professionals can use art galleries, urban lofts, coffee shops, or modern spaces that reflect creativity while maintaining professionalism appropriate for client presentations."
    }
  ],

  "background-mistakes": [
    {
      question: "Why does my virtual background look blurry?",
      answer: "Blurry backgrounds are usually caused by low-resolution images or poor lighting. Use high quality images (1456×816 or higher) and ensure you have good front-facing lighting to improve background quality."
    },
    {
      question: "Why does my virtual background cut off parts of me?",
      answer: "This happens when your background contrasts poorly with your clothing or lighting. Avoid wearing colors that match your background, ensure good lighting, and sit still to help your camera detect edges properly."
    },
    {
      question: "What backgrounds should I avoid for professional meetings?",
      answer: "Avoid distracting patterns, overly casual settings like bedrooms, meme backgrounds, anything political or controversial, and low-quality pixelated images. Choose professional, subtle backgrounds instead."
    },
    {
      question: "How can I improve my virtual background quality?",
      answer: "Use high-resolution images, ensure good lighting on your face, avoid matching your clothing to the background, sit still during calls, and test your background before important meetings."
    }
  ],

  "lighting-tips": [
    {
      question: "What's the best lighting setup for video calls?",
      answer: "The best setup uses natural window light from the front or a ring light at eye level. Three-point lighting (key light, fill light, and back light) is ideal for professional results."
    },
    {
      question: "Should I use a ring light for video calls?",
      answer: "Ring lights are excellent for video calls as they provide even, flattering illumination. Position the ring light at eye level, about 2-3 feet away, for the best results."
    },
    {
      question: "How do I avoid shadows on video calls?",
      answer: "Use diffused lighting from multiple angles, avoid harsh overhead lights, and position your main light source in front of you at eye level. Natural window light is often the most flattering."
    },
    {
      question: "What color temperature is best for video calls?",
      answer: "5000-6500K (daylight white) is ideal for video calls as it appears natural and professional. Avoid overly warm (yellow) or cool (blue) lighting which can look unflattering."
    }
  ],

  "virtual-background-guide": [
    {
      question: "How do I set up a virtual background on Zoom?",
      answer: "In Zoom, go to Settings > Background & Effects, choose a virtual background or upload your own image. Enable 'I have a green screen' if using one for better results."
    },
    {
      question: "How do I add a virtual background in Microsoft Teams?",
      answer: "In Teams, click your profile picture > Settings > Devices > Camera settings > Background effects. Choose from built-in backgrounds or upload custom images."
    },
    {
      question: "Can I use virtual backgrounds without a green screen?",
      answer: "Yes! Modern video platforms use AI to detect your outline without a green screen. However, good lighting and a contrasting background improve edge detection quality."
    },
    {
      question: "What resolution should virtual backgrounds be?",
      answer: "Virtual backgrounds should be at least 1456×816 pixels for high quality. Higher resolutions work fine, but anything lower than 1280x720 may appear pixelated."
    }
  ],

  "zoom-teams-google": [
    {
      question: "Which video platform has the best virtual backgrounds?",
      answer: "Zoom, Teams, and Google Meet all support virtual backgrounds well. Zoom offers the most customization options, Teams has good integration with Microsoft 365, and Google Meet is simple and reliable."
    },
    {
      question: "Can I use the same background image on all video platforms?",
      answer: "Yes! Virtual background images work across all platforms. Download once from MeetBackdrops and upload to Zoom, Teams, Google Meet, or any other platform."
    },
    {
      question: "Which platform has better virtual background quality?",
      answer: "All three platforms (Zoom, Teams, Google Meet) offer good quality virtual backgrounds. The main difference is in edge detection accuracy, which depends more on your lighting than the platform."
    },
    {
      question: "Do virtual backgrounds slow down my computer?",
      answer: "Virtual backgrounds require some processing power. If you have an older computer, you may experience slight performance impact. Closing unnecessary programs can help."
    }
  ],

  'christmas-backgrounds': [
    {
      question: "Are these Christmas backgrounds free to use?",
      answer: "Yes! All our Christmas virtual backgrounds are completely free to download and use for personal and professional video calls."
    },
    {
      question: "Will these Christmas backgrounds work with Zoom, Teams, and Google Meet?",
      answer: "Absolutely! Our Christmas backgrounds work with all major video conferencing platforms including Zoom, Microsoft Teams, Google Meet, Skype, and any platform that supports custom virtual backgrounds."
    },
    {
      question: "When should I start using Christmas backgrounds?",
      answer: "You can start using Christmas backgrounds anytime in December, or even late November if you want to get in the holiday spirit early. For professional business meetings, you might want to wait until closer to the holidays."
    },
    {
      question: "Are the Christmas backgrounds appropriate for business meetings?",
      answer: "Yes! Our collection includes subtle, professional Christmas backgrounds perfect for business meetings, as well as more festive options for casual calls and holiday parties."
    }
  ],

  "remote-work-productivity": [
    {
      question: "How can I stay productive while working from home?",
      answer: "Create a dedicated workspace, maintain regular hours, use professional virtual backgrounds for calls, minimize distractions, take regular breaks, and establish clear boundaries between work and personal time."
    },
    {
      question: "What's the best home office setup for remote work?",
      answer: "An ideal home office includes a comfortable desk and chair, good lighting (natural or ring light), reliable internet, quality webcam and microphone, and professional virtual backgrounds for video calls."
    },
    {
      question: "How do virtual backgrounds improve remote work?",
      answer: "Virtual backgrounds maintain professionalism, protect privacy, minimize distractions, create consistent branding, and help separate work from home life during video calls."
    },
    {
      question: "Should I use video backgrounds for all work calls?",
      answer: "Use virtual backgrounds for client meetings, presentations, and formal calls. For casual team meetings, your actual background may be fine if it's clean and professional."
    }
  ],
  "video-call-equipment-guide": [
  {
    question: "Do I really need to buy equipment for video calls?",
    answer: "While not strictly necessary, investing in proper equipment (ring light, webcam, microphone, green screen) dramatically improves your professional appearance and can pay for itself in a single important call. The complete setup costs under $150 and lasts for years."
  },
  {
    question: "What's the single most important equipment upgrade for video calls?",
    answer: "Lighting is the most important upgrade. A $40 ring light will make more difference than any other single purchase. Even an expensive webcam looks bad with poor lighting, while a basic webcam looks great with proper lighting."
  },
  {
    question: "Can I use my phone or laptop camera instead of buying a webcam?",
    answer: "You can, but laptop cameras are typically low-resolution (720p) with poor low-light performance. A dedicated 1080p webcam for $50-80 provides noticeably sharper, more professional video quality."
  },
  {
    question: "Do I need a green screen to use virtual backgrounds?",
    answer: "No, but a green screen significantly improves virtual background quality. Without one, you may see halos, fuzzy edges, or parts of you disappearing. A collapsible green screen costs $25-35 and eliminates these issues completely."
  },
  {
    question: "Will this equipment work with my laptop?",
    answer: "Yes! All recommended equipment (ring light, webcam, microphone, green screen) is USB plug-and-play and works with Mac, Windows, and Chromebook. No special installation or technical knowledge required."
  },
  {
    question: "Where can I buy this video call equipment?",
    answer: "All recommended equipment is available on Amazon with fast shipping. We've included direct links to specific products that offer the best value for professional video calls."
  }
]
  ,

  // HD Virtual Backgrounds FAQs
  'hd-virtual-backgrounds': [
    {
      question: "What resolution are the HD virtual backgrounds?",
      answer: "Our HD backgrounds are 2912×1632 pixels — roughly 2.5K resolution. That's approximately 2.3× the pixel count of a standard 1080p image, giving the codec significantly more detail to work with before compression."
    },
    {
      question: "Why do HD backgrounds look better on Zoom and Teams?",
      answer: "Zoom, Teams, and Google Meet compress your video stream before sending it to other participants. A higher-resolution source image retains more detail after that compression. A 2912×1632 background stays visibly sharper than a 1080p one at the same stream quality."
    },
    {
      question: "Are the free backgrounds lower quality than the HD ones?",
      answer: "The free backgrounds are 1456×816 — high enough for most video calls. The HD versions (2912×1632) are noticeably sharper on large monitors, during presentations on room screens, and any time the background is scrutinised closely."
    },
    {
      question: "What file format are the HD backgrounds?",
      answer: "HD backgrounds download as PNG files. PNG is the recommended format for all three major platforms — Zoom, Teams, and Google Meet accept it directly with no conversion needed."
    },
    {
      question: "How much do HD virtual backgrounds cost?",
      answer: "HD backgrounds are available in packs starting at $4.99 for a single image. Multi-image packs offer savings up to 60% — a 20-image pack is $39.99. There is also a monthly subscription option for 10 downloads per month."
    },
    {
      question: "Do I need a green screen for HD virtual backgrounds?",
      answer: "No green screen is required. HD backgrounds work with your platform's built-in background removal. A green screen will improve edge quality for any virtual background, but it is not a requirement for the HD versions specifically."
    },
    {
      question: "Are HD backgrounds optimised for Zoom, Teams, and Google Meet?",
      answer: "Yes. Unlike stock photo sites that offer general-purpose images, every background on MeetBackdrops — including HD versions — is composed specifically for video calls: correct 16:9 framing, depth that reads as a real space, and lighting that matches typical webcam setups."
    }
  ],

  'logo-virtual-background': [
    {
      question: "Can I add my company logo to a virtual background for free?",
      answer: "Yes. Download a free background from MeetBackdrops, then use Canva or Adobe Express (both free) to overlay your logo PNG. Export the result as a PNG and upload it to Zoom, Teams, or Google Meet like any other virtual background."
    },
    {
      question: "What format should my logo be for a virtual background?",
      answer: "Use a PNG file with a transparent background — not JPG. A transparent PNG lets your logo sit cleanly on the background without a white or coloured box around it. If you only have a JPG, you can remove the background free at remove.bg."
    },
    {
      question: "Which virtual backgrounds work best for adding a logo?",
      answer: "Backgrounds with a relatively plain area — clean walls, uncluttered surfaces — give your logo the most visibility. Art galleries, conference rooms, and office spaces tend to have the most suitable areas. Avoid busy textures like bookshelves, where logos get lost."
    },
    {
      question: "Where should I position my logo on a virtual background?",
      answer: "The bottom-right corner is usually best — it's below and beside where your torso appears, so it stays visible without competing with your face. Top-right also works well. Avoid the centre and top-centre, which will overlap with your head."
    },
    {
      question: "Can I use a branded background across my whole team?",
      answer: "Yes. Create the final image (background + logo) once in Canva or Adobe Express, then share the PNG directly with your team via Slack, email, or a shared drive. Each person uploads it to their own Zoom or Teams settings. No need for everyone to repeat the design steps."
    }
  ],

  'how-to-change-zoom-background-pc': [
    {
      question: "How do I change my Zoom background on a PC?",
      answer: "Open Zoom and click the gear icon (Settings) in the top-right corner. Select Background & Effects in the left panel, then click the Virtual Background tab. Click the + button to upload your image file. Zoom saves it automatically for future calls."
    },
    {
      question: "Why is the virtual background option greyed out in Zoom?",
      answer: "On a personal or free account, go to zoom.us → sign in → Settings → scroll to Virtual background → toggle it on, then reopen the desktop app. On a work account managed by your company, you need to ask your IT administrator to enable it in the Zoom admin console."
    },
    {
      question: "What image format should I use for a Zoom background on PC?",
      answer: "Zoom accepts JPG, PNG, GIF, and MP4 video files. Use a 16:9 landscape image at 1920×1080 pixels or higher. Portrait-format photos and square images will stretch or tile incorrectly."
    },
    {
      question: "How do I make my Zoom background look realistic?",
      answer: "Use a high-resolution 16:9 image of a real space — an office, bookshelf, or room with visible depth. Flat graphics and gradient backgrounds make the AI blending obvious. Face a light source (window or ring light) to improve edge detection quality."
    }
  ],

  'virtual-background-setup-by-platform': [
    {
      question: "How do I set up a virtual background on Zoom?",
      answer: "Open Zoom Settings → Background & Effects → Virtual Background → click the + button to upload your image. Once added, the background persists between calls. You can also change it during a call via the ^ arrow next to your video button → Choose Virtual Background."
    },
    {
      question: "How do I add a virtual background in Microsoft Teams?",
      answer: "On the pre-join screen, click Background effects → Add new to upload your image. During a call, go to the three-dot More menu → Video effects and avatars → Add new. Teams accepts JPG and PNG files up to 5 MB."
    },
    {
      question: "How do I use a custom background in Google Meet?",
      answer: "Before joining, click Apply visual effects below your video preview → scroll to the bottom → click the + upload icon. During a call, go to More options (⋮) → Apply visual effects → upload icon. Custom backgrounds persist between calls since 2023."
    },
    {
      question: "Do I need a green screen to use a virtual background?",
      answer: "No. All four major platforms — Zoom, Teams, Google Meet, and Webex — use AI to detect your outline without a green screen. A green screen improves edge quality if you want sharper results, but it is not required."
    },
    {
      question: "Why does my virtual background look fake or pixelated?",
      answer: "The issue is almost always the background image rather than the setup. Use a 16:9 image (1920×1080 or higher) — never a portrait or square photo. Images of real physical spaces with depth and natural lighting look far more convincing than flat illustrations or gradient patterns."
    },
    {
      question: "What image formats do video call platforms accept for virtual backgrounds?",
      answer: "Zoom accepts JPG, PNG, GIF, and MP4 (video). Microsoft Teams, Google Meet, and Webex accept JPG and PNG. All platforms recommend images no larger than 5 MB and at least 1920×1080 pixels for best quality."
    }
  ]
};

// Persona collection FAQs — keyed by collection slug. Wired into schema via
// lib/collections/engine.js → collectionSeo() and rendered visibly on
// /collections/{slug} so Google's visible-content check matches the schema.
const personaFaqs = {
  "zoom-backgrounds-for-lawyers": [
    {
      question: "What virtual background should a lawyer use on Zoom?",
      answer: "Book-lined shelves, law-library scenes, and quietly authoritative paneled offices read as the most credible on client calls and remote depositions. Avoid anything overtly hospitality, recreational, or seasonal — those undercut the trust signal that does most of the work before you open your mouth."
    },
    {
      question: "Are these backgrounds appropriate for remote depositions and court appearances?",
      answer: "For client meetings and internal depositions, yes — these are exactly the kind of neutral, established environments most courts and bar guidance recommend. For an actual court appearance, always check that court's local rules first; some now require a plain wall or specifically prohibit virtual backgrounds entirely."
    },
    {
      question: "Is a virtual background allowed for client confidentiality reasons?",
      answer: "Many firms actively encourage virtual backgrounds because they prevent inadvertent disclosure of case files, screens, or whiteboards visible in the real room. The background itself doesn't replace confidentiality controls, but it removes one common leak path."
    },
    {
      question: "Will these work on Microsoft Teams as well as Zoom?",
      answer: "Yes — every background is 16:9 PNG, accepted as a custom background on Zoom, Microsoft Teams, Google Meet, and Webex. The same image works across all four, so you can keep one consistent backdrop across your firm's stack."
    }
  ],

  "zoom-backgrounds-for-therapists": [
    {
      question: "What makes a good virtual background for a teletherapy session?",
      answer: "Warm, soft, uncluttered. A client on a hard week needs the space behind you to feel safe and quiet, not clinical or busy. Soft light, natural materials, and a calm palette help a session settle the moment the call connects."
    },
    {
      question: "Are these backgrounds HIPAA-compatible?",
      answer: "The backgrounds themselves don't create or remove HIPAA risk — your platform, network, and consent paperwork do. That said, a virtual background helps prevent accidental disclosure of family photos, papers, or other identifying information visible in your real room, which is a common HIPAA hygiene recommendation."
    },
    {
      question: "Should I use the same background every session?",
      answer: "Most therapists find consistency helps — clients associate the space with the relationship, and changing it every session can feel destabilizing. Pick one or two that fit the tone of your practice and rotate sparingly."
    },
    {
      question: "Do warm backgrounds really change how a client feels on a call?",
      answer: "There's good evidence that warm, uncluttered environments lower a viewer's perceived stress on video — the same reason waiting rooms are designed that way. A calm backdrop won't fix a hard session, but it reduces the friction of a client arriving."
    }
  ],

  "zoom-backgrounds-for-realtors": [
    {
      question: "What background should a realtor use on a Zoom listing call?",
      answer: "Bright, aspirational interiors — airy living rooms, modern kitchens, well-lit home offices. You sell space for a living, so the space behind you should look like the kind a buyer wants to live in. Avoid anything too formal or corporate; warmth converts better in real estate."
    },
    {
      question: "Should I use a background that matches the property I'm listing?",
      answer: "Tempting but usually a mistake — if the background is more impressive than the property, it backfires; if it's less, you've undercut your own listing. Use a neutral, polished interior that signals taste without competing with the specific home you're showing."
    },
    {
      question: "Are these backgrounds OK for showing properties live on video?",
      answer: "These are designed for your end of the call — your introduction, follow-ups, negotiation calls, and CMA presentations. When you're actually walking a property, you'll switch your camera to the real space; the virtual background is for the conversation around the property."
    },
    {
      question: "Do these work on Teams for brokerage internal calls too?",
      answer: "Yes — same PNG works on Zoom, Microsoft Teams, and Google Meet. Many agents use one background for client calls and a slightly different one for brokerage and team meetings."
    }
  ],

  "zoom-backgrounds-for-consultants": [
    {
      question: "What virtual background looks most credible for a consulting call?",
      answer: "Sharp, modern offices with minimal clutter and bright, even light. Consulting runs on perceived seniority — your backdrop should read as the kind of room a partner would call from, not a home office. Avoid anything overly warm or homey for partner-level pitches."
    },
    {
      question: "Should I match my background to the client's industry?",
      answer: "Slightly, yes. A formal tech-style minimal office signals well to enterprise software clients; a warmer, book-lined office reads better with financial-services and legal clients. The backdrop is part of the message — pick the one that flatters the room you're trying to walk into."
    },
    {
      question: "Are these appropriate for partner-level pitch meetings?",
      answer: "Yes — every background in the consulting collection is composed to read as senior on camera. For very high-stakes pitches, pair the background with HD (2912×1632) so it stays crisp even when the client records the meeting."
    },
    {
      question: "What's the HD edition worth on a consulting call?",
      answer: "On 27\"+ monitors, executive cameras, and recorded calls, the free 1456×816 softens visibly under codec compression. HD (2912×1632) covers QHD natively and holds its sharpness even when the client replays the recording — meaningful when a $50K+ deal is on the line."
    }
  ],

  "zoom-backgrounds-for-financial-advisors": [
    {
      question: "What background signals trust on a financial-planning call?",
      answer: "Established, book-lined offices and refined interiors. Money conversations run on stability — your backdrop should suggest 'I've been doing this for a long time' even if you're newer to the practice. Avoid trendy or sparse minimal looks; they undercut the permanence signal."
    },
    {
      question: "Are these backgrounds compliant for FINRA-regulated calls?",
      answer: "The backgrounds themselves don't carry compliance implications, but a virtual background reduces the risk of accidentally exposing client documents, screens, or notes visible in the real room — which is a known compliance recommendation for advisors who take client calls from home."
    },
    {
      question: "Should I use the same background as my office?",
      answer: "Consistency is a small but real trust signal. If a client sees the same backdrop on every call, it reinforces 'this person has a real, established practice.' Pick one anchor background for client calls and one alternative for internal and team meetings."
    },
    {
      question: "Do these work for client onboarding videos and recorded reviews?",
      answer: "Yes — and for recordings specifically, the HD edition (2912×1632) is worth it. Recorded review videos get rewatched and forwarded; the free 1456×816 softens under compression and degrades on the second play."
    }
  ],

  "zoom-backgrounds-for-healthcare": [
    {
      question: "What's the best virtual background for a telehealth visit?",
      answer: "Bright, clean, and uncluttered — the visual equivalent of a tidy exam room. Patients are already nervous; the background's job is to lower friction, not introduce it. Soft neutral tones, good light, no busy decor."
    },
    {
      question: "Are these HIPAA-friendly?",
      answer: "The image itself has no HIPAA implications — but using a virtual background prevents accidental disclosure of patient files, monitors, charts, or family photos visible in your real space, which most telehealth compliance guides recommend."
    },
    {
      question: "Should clinicians avoid certain background types?",
      answer: "Avoid anything overtly hospitality (cafes, bars), heavily decorated, or visually busy. Patients read clinical neutrality as competence; ornamentation reads as distraction. Stick to clean, light, calm spaces."
    },
    {
      question: "Do these work on Doxy.me, Zoom for Healthcare, and other telehealth platforms?",
      answer: "Yes — these are standard 16:9 PNGs and work on any platform that accepts a custom background, including Doxy.me, Zoom for Healthcare, Teams, and Google Meet. The same file works across your whole telehealth stack."
    }
  ],

  "zoom-backgrounds-for-teachers": [
    {
      question: "What virtual background works best for teaching online?",
      answer: "Warm, lightly book-lined, and uncluttered. The background should feel inviting enough that students don't disengage but calm enough that it doesn't pull focus from the lesson. Bright bookshelves, soft living rooms, and home-office scenes all work well."
    },
    {
      question: "Are bright or dark backgrounds better for younger students?",
      answer: "Bright. Younger students engage more readily with brighter, lighter spaces — they read as cheerful and approachable. Save the darker, more formal backgrounds for advanced or graduate-level teaching where they reinforce subject seriousness."
    },
    {
      question: "Do these backgrounds work on Google Classroom and Meet?",
      answer: "Yes — Google Meet's segmentation handles these backgrounds well, and the same PNG works on Zoom and Teams if your district uses multiple platforms. No subscription or signup required."
    },
    {
      question: "Will a busy background make it harder for students to focus?",
      answer: "Yes — that's why these collections are curated for camera. Calm, soft-edged interiors don't compete with the on-screen content. Avoid anything with strong patterns, lots of motion-looking texture, or saturated colors when teaching."
    }
  ],

  "zoom-backgrounds-for-tech-professionals": [
    {
      question: "What background looks right for a tech or startup call?",
      answer: "Modern, minimal, and design-forward — clean lofts, well-lit minimal offices, and considered interiors. Tech audiences read design instantly, and a generic blurred room undercuts both you and the work. Pick something that looks intentional."
    },
    {
      question: "Should engineers use the same background as founders and designers?",
      answer: "Mostly yes — the audience reads design taste the same way regardless of role. Founders and salespeople sometimes want a slightly warmer office; engineers and designers tend toward the cleanest, most minimal options. Both are in the tech collection."
    },
    {
      question: "Do these work for demo days, investor calls, and conference panels?",
      answer: "Yes — and for investor calls and recorded conference talks, the HD edition is worth it. The free 1456×816 softens noticeably when the recording gets reshared at full screen on YouTube or LinkedIn."
    },
    {
      question: "Will these read well on a code-screen-share call?",
      answer: "Yes — the minimal palette doesn't fight a shared editor or terminal in picture-in-picture. The point is that you stay visually quiet so the code stays visually loud."
    }
  ],

  "zoom-backgrounds-for-recruiters": [
    {
      question: "What background should a recruiter use on a candidate interview?",
      answer: "Bright, welcoming, real-looking offices. The interview is a two-way impression — candidates judge your employer's culture from your backdrop too. Cold corporate or empty backgrounds make candidates more nervous; warm professional offices put them at ease."
    },
    {
      question: "Should I use a different background than the hiring manager?",
      answer: "Yes, if you can. A different (but coordinated) backdrop on the recruiter call vs. the hiring-manager call signals two real people from one real organization, which subconsciously reads as a more established employer."
    },
    {
      question: "Are these backgrounds appropriate for executive search?",
      answer: "Yes — the office-spaces and home-office subsets in this collection read as senior and considered, which is the right tone for executive candidates. For very senior search, lean toward the more formal office backgrounds."
    },
    {
      question: "Will candidates judge me for using a virtual background?",
      answer: "The opposite, usually. A clean, intentional virtual background reads as 'this person took the call seriously.' A messy real room or a default platform blur reads as 'this is a side task.'"
    }
  ],

  "zoom-backgrounds-for-sales": [
    {
      question: "What background helps close a sale on Zoom?",
      answer: "Polished, modern offices that read as successful and credible — the kind of room a prospect expects a top closer to call from. Avoid anything that reads as a home office for enterprise pitches; lean more home-office and warm for SMB and consumer."
    },
    {
      question: "Should AEs, SDRs, and sales leaders all use the same background?",
      answer: "Not exactly — but they should all look like they call from the same organization. SDRs can lean slightly warmer and more home-office; AEs and leaders should lean more polished office. Consistency across the team signals a real, organized sales org."
    },
    {
      question: "Does the background actually affect close rate?",
      answer: "There's no clean public data, but every sales coach who studies video calls flags that prospect trust is set in the first few seconds — and your backdrop is half of that signal. A sharp, considered backdrop is one of the cheapest trust-multipliers in the deal cycle."
    },
    {
      question: "Is HD worth it on a sales call?",
      answer: "For mid-market and enterprise calls where the prospect records or replays, yes — the HD edition (2912×1632) stays sharp on rewatch. For high-volume SDR calls and demos, the free 1456×816 is fine; the prospect won't replay them."
    }
  ],

  "zoom-backgrounds-for-coaches": [
    {
      question: "What virtual background works best for a coaching call?",
      answer: "Warm, soft, lightly personal. Coaching runs on connection — your client needs to feel like they're in a real, lived-in space with you, not a corporate office. Soft light, books, plants, and casual interiors all help build the rapport coaching depends on."
    },
    {
      question: "Should life coaches and business coaches use different backgrounds?",
      answer: "Slightly. Life coaches tend to do better with warmer, more home-like backdrops that lower the client's defenses. Business coaches can use the same or lean slightly more office-styled if their clientele is C-suite or VC-backed founders."
    },
    {
      question: "Will a too-corporate background hurt client engagement?",
      answer: "Often yes — a sharp executive office reads as transactional, which is the opposite of what coaching wants. If you find clients are slow to open up on calls, try a warmer, more personal background as a cheap test."
    },
    {
      question: "Do these backgrounds work for group coaching and recorded sessions?",
      answer: "Yes — and for recorded group sessions especially, the HD edition holds up better when participants replay the recording. The warmer-toned backgrounds also compress more gracefully than sharp high-contrast ones."
    }
  ],

  "zoom-backgrounds-for-accountants": [
    {
      question: "What background should an accountant or CPA use on a client call?",
      answer: "Orderly, established, lightly book-lined offices. Accountants live on perceived precision, and a tidy, traditional backdrop reinforces it in a way a casual home office can't. Avoid anything overly creative or hospitality-themed."
    },
    {
      question: "Do these backgrounds work during tax season for review calls?",
      answer: "Yes — and tax season is the time it matters most. Clients are anxious, and a calm, established backdrop on every review call lowers their stress and shortens the meeting. Pick one anchor background and use it for every client review."
    },
    {
      question: "Are these appropriate for partner and audit-committee calls?",
      answer: "Yes — the formal office and bookshelves options in this collection are tuned for that level of meeting. For very formal audit-committee video calls, the darker, more wood-toned options read more senior."
    },
    {
      question: "Should bookkeepers use the same backgrounds as CPAs?",
      answer: "Functionally yes — the trust signal is the same regardless of credential. Some bookkeepers lean slightly more home-office to signal approachability with SMB clients; that's fine, and the collection includes both registers."
    }
  ],
};

// Merge persona FAQs into the main map so getFAQs(slug) resolves them.
Object.assign(faqData, personaFaqs);

// Helper function to get FAQs for a specific page
export function getFAQs(pageKey) {
  return faqData[pageKey] || [];
}