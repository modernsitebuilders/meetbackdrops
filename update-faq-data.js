const fs = require('fs');

const filePath = 'data/faqData.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add bokeh-backgrounds FAQ section after halloween-backgrounds
const bokehFAQs = `
  'bokeh-backgrounds': [
    {
      question: "What is a bokeh background?",
      answer: "Bokeh backgrounds feature soft, out-of-focus circles of light that create an artistic, elegant effect. The term 'bokeh' comes from photography and describes the aesthetic quality of blur. For video calls, bokeh backgrounds add visual interest and depth without being distracting."
    },
    {
      question: "Are bokeh backgrounds professional enough for business calls?",
      answer: "Yes! Bokeh backgrounds are an excellent professional choice. The soft, elegant light effects create a polished look without being overly casual or distracting. Many professionals use bokeh backgrounds for client meetings, presentations, and interviews because they strike the perfect balance between interesting and appropriate."
    },
    {
      question: "What color bokeh background should I choose?",
      answer: "For professional settings, warm gold, amber, cool blue, or neutral gray bokeh work well. For creative fields, try colorful options like purple, teal, or gradient effects. For evening calls, warm string light bokeh is perfect. Choose colors that complement your lighting and contrast with your clothing."
    },
    {
      question: "Do bokeh backgrounds work well with virtual background software?",
      answer: "Yes! Bokeh backgrounds actually work exceptionally well because the soft, blurred nature helps video conferencing software better distinguish between you and the background. This results in cleaner edges and fewer artifacts compared to detailed or busy backgrounds."
    },
    {
      question: "Can I use these bokeh backgrounds for free?",
      answer: "Absolutely! All 66 bokeh backgrounds are completely free to download and use for personal or professional video calls. No signup required, no watermarks, and no usage restrictions."
    },
    {
      question: "What's the difference between bokeh and regular blurred backgrounds?",
      answer: "Bokeh specifically creates circular or shaped light patterns with aesthetic qualities, while regular blur is just an unfocused image. Bokeh has intentional artistic quality with recognizable light circles or shapes, making it more visually appealing than simple blur."
    },
    {
      question: "Are these backgrounds suitable for job interviews?",
      answer: "Yes! Subtle bokeh backgrounds in professional colors (blue, gray, soft white) are excellent for interviews. They show attention to detail and professionalism while keeping the focus on you. Avoid overly bright or colorful options for formal interview settings."
    },
    {
      question: "Do I need special lighting to use bokeh backgrounds?",
      answer: "While you don't need special lighting, good front-facing light will make any virtual background look better. Bokeh backgrounds are forgiving and work well with various lighting setups. For the most realistic look, try to match the color temperature of the bokeh (warm vs cool) to your actual lighting."
    }
  ],`;

// Find the halloween-backgrounds section and add bokeh after it
content = content.replace(
  `  'halloween-backgrounds': [`,
  `  'bokeh-backgrounds': [
    {
      question: "What is a bokeh background?",
      answer: "Bokeh backgrounds feature soft, out-of-focus circles of light that create an artistic, elegant effect. The term 'bokeh' comes from photography and describes the aesthetic quality of blur. For video calls, bokeh backgrounds add visual interest and depth without being distracting."
    },
    {
      question: "Are bokeh backgrounds professional enough for business calls?",
      answer: "Yes! Bokeh backgrounds are an excellent professional choice. The soft, elegant light effects create a polished look without being overly casual or distracting. Many professionals use bokeh backgrounds for client meetings, presentations, and interviews because they strike the perfect balance between interesting and appropriate."
    },
    {
      question: "What color bokeh background should I choose?",
      answer: "For professional settings, warm gold, amber, cool blue, or neutral gray bokeh work well. For creative fields, try colorful options like purple, teal, or gradient effects. For evening calls, warm string light bokeh is perfect. Choose colors that complement your lighting and contrast with your clothing."
    },
    {
      question: "Do bokeh backgrounds work well with virtual background software?",
      answer: "Yes! Bokeh backgrounds actually work exceptionally well because the soft, blurred nature helps video conferencing software better distinguish between you and the background. This results in cleaner edges and fewer artifacts compared to detailed or busy backgrounds."
    },
    {
      question: "Can I use these bokeh backgrounds for free?",
      answer: "Absolutely! All 66 bokeh backgrounds are completely free to download and use for personal or professional video calls. No signup required, no watermarks, and no usage restrictions."
    },
    {
      question: "What's the difference between bokeh and regular blurred backgrounds?",
      answer: "Bokeh specifically creates circular or shaped light patterns with aesthetic qualities, while regular blur is just an unfocused image. Bokeh has intentional artistic quality with recognizable light circles or shapes, making it more visually appealing than simple blur."
    },
    {
      question: "Are these backgrounds suitable for job interviews?",
      answer: "Yes! Subtle bokeh backgrounds in professional colors (blue, gray, soft white) are excellent for interviews. They show attention to detail and professionalism while keeping the focus on you. Avoid overly bright or colorful options for formal interview settings."
    },
    {
      question: "Do I need special lighting to use bokeh backgrounds?",
      answer: "While you don't need special lighting, good front-facing light will make any virtual background look better. Bokeh backgrounds are forgiving and work well with various lighting setups. For the most realistic look, try to match the color temperature of the bokeh (warm vs cool) to your actual lighting."
    }
  ],

  'halloween-backgrounds': [`
);

fs.writeFileSync(filePath, content);
console.log('✓ Updated data/faqData.js');
