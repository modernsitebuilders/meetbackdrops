// data/howToData.js
// HowTo structured data for tutorial blog posts

export const howToData = {
  'how-to-change-zoom-background-pc': {
    name: "How to Change Your Zoom Background on a PC",
    description: "Step-by-step guide to changing your Zoom virtual background on a Windows PC in under 60 seconds",
    totalTime: "PT2M", // 2 minutes
    steps: [
      {
        name: "Open Zoom Settings",
        text: "Open Zoom on your PC and click the gear icon in the top-right corner to open the Settings panel."
      },
      {
        name: "Go to Background & Effects",
        text: "In the left panel of Settings, click 'Background & Effects', then make sure the 'Virtual Background' tab is selected."
      },
      {
        name: "Upload Your Background Image",
        text: "Click the + button (Add image or video) and select your background image file from your computer. Use a 16:9 JPG or PNG image at 1920×1080 pixels or higher."
      },
      {
        name: "Apply the Background",
        text: "Click your newly uploaded background thumbnail to apply it. Zoom saves it automatically — it will be active for every future call without needing to repeat these steps."
      }
    ]
  },

  'virtual-background-guide': {
    name: "How to Set Up Virtual Backgrounds for Video Calls",
    description: "Complete step-by-step guide to setting up virtual backgrounds on Zoom, Microsoft Teams, and Google Meet",
    totalTime: "PT15M", // 15 minutes
    steps: [
      {
        name: "Download Your Virtual Background",
        text: "Visit StreamBackdrops and browse the collection of free high quality virtual backgrounds. Click on any background you like and download it to your computer."
      },
      {
        name: "Open Your Video Conferencing App",
        text: "Launch Zoom, Microsoft Teams, or Google Meet on your computer. Make sure you're using the desktop application for the best results."
      },
      {
        name: "Access Settings",
        text: "For Zoom: Click your profile picture and select Settings. For Teams: Click your profile picture, then Settings. For Google Meet: Join a meeting and click the three dots menu."
      },
      {
        name: "Find Virtual Background Settings",
        text: "For Zoom: Navigate to Background & Effects. For Teams: Go to Devices, then Background effects. For Google Meet: Select Apply visual effects."
      },
      {
        name: "Upload Your Background",
        text: "Click the plus (+) button or 'Add image' option. Select the virtual background you downloaded from your computer."
      },
      {
        name: "Test and Adjust",
        text: "Preview how the background looks with your video. Adjust your lighting and camera position if needed for the best edge detection."
      },
      {
        name: "Apply Your Background",
        text: "Click 'Apply' or close the settings window. Your virtual background is now active and ready for your video calls."
      }
    ]
  },

  'lighting-tips': {
    name: "How to Set Up Perfect Lighting for Virtual Backgrounds",
    description: "Step-by-step guide to achieve professional lighting for video calls with virtual backgrounds",
    totalTime: "PT20M", // 20 minutes
    steps: [
      {
        name: "Position Yourself Facing Natural Light",
        text: "Sit facing a window if possible. Natural light from the front provides the most flattering illumination and helps virtual background edge detection."
      },
      {
        name: "Add a Key Light",
        text: "Place your main light source (ring light or desk lamp) directly in front of you at face level, slightly above your monitor."
      },
      {
        name: "Eliminate Backlighting",
        text: "Avoid having windows or bright lights behind you. This causes silhouetting and makes virtual background detection difficult."
      },
      {
        name: "Add Fill Lighting",
        text: "Place a second, softer light to the side to reduce harsh shadows. This can be a lamp with a diffuser or even a white reflector board."
      },
      {
        name: "Test Your Camera Settings",
        text: "Open your video conferencing app and check how the lighting looks on camera. Adjust brightness and position as needed."
      },
      {
        name: "Fine-Tune Virtual Background Detection",
        text: "Once lighting is optimized, test your virtual background. Good lighting dramatically improves edge quality and reduces glitching."
      }
    ]
  },

  'professional-video-calls': {
    name: "How to Look Professional on Video Calls",
    description: "Complete guide to presenting yourself professionally during virtual meetings and video conferences",
    totalTime: "PT10M", // 10 minutes
    steps: [
      {
        name: "Choose the Right Background",
        text: "Select a professional virtual background from StreamBackdrops, such as a clean office space or well-lit bookshelf. Avoid distracting or overly casual backgrounds."
      },
      {
        name: "Position Your Camera at Eye Level",
        text: "Place your laptop on a stand or stack of books so the camera is at eye level. This creates a more natural, engaging perspective."
      },
      {
        name: "Set Up Proper Lighting",
        text: "Ensure your face is well-lit from the front. Use natural light from a window or add a ring light to eliminate shadows."
      },
      {
        name: "Test Your Audio",
        text: "Use headphones with a microphone for clearer audio. Test your sound before the meeting and minimize background noise."
      },
      {
        name: "Frame Yourself Correctly",
        text: "Position yourself so your head and shoulders are visible with some space above your head. Follow the rule of thirds for ideal framing."
      },
      {
        name: "Dress Professionally",
        text: "Wear appropriate business attire even from home. Solid colors work best on camera and help maintain a professional appearance."
      },
      {
        name: "Minimize Distractions",
        text: "Close unnecessary apps, silence notifications, and let others in your home know you're in a meeting to avoid interruptions."
      }
    ]
  },

  'zoom-teams-google': {
    name: "How to Set Up Virtual Backgrounds on Different Platforms",
    description: "Platform-specific instructions for setting up virtual backgrounds on Zoom, Microsoft Teams, and Google Meet",
    totalTime: "PT15M", // 15 minutes
    steps: [
      {
        name: "Download Your Virtual Background",
        text: "Choose and download a professional virtual background from StreamBackdrops in high quality."
      },
      {
        name: "Set Up Virtual Background in Zoom",
        text: "Open Zoom, click your profile picture, select Settings, navigate to Background & Effects, click the plus button, and upload your downloaded image."
      },
      {
        name: "Set Up Virtual Background in Microsoft Teams",
        text: "Open Teams, click your profile picture, select Settings, go to Devices, click Background effects, select Add new, and upload your background."
      },
      {
        name: "Set Up Virtual Background in Google Meet",
        text: "Join or start a Google Meet call, click the three dots menu, select Apply visual effects, click Add button under Backgrounds, and upload your image."
      },
      {
        name: "Test Each Platform",
        text: "Preview your virtual background on each platform before your actual meeting. Check edge quality and lighting for best results."
      },
      {
        name: "Optimize for Each Platform",
        text: "Adjust lighting and camera position based on each platform's detection algorithm. Zoom typically has the best edge detection."
      }
    ]
  }
};