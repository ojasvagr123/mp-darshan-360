import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { projectToMap } from "../src/map.js";

const prisma = new PrismaClient();

function svgPanoramaDataUrl(title, sky, land, accent) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1200" viewBox="0 0 2400 1200">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${sky}"/>
        <stop offset="65%" stop-color="#e9f7ff"/>
        <stop offset="100%" stop-color="#fff0bf"/>
      </linearGradient>
      <linearGradient id="ground" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${land}"/>
        <stop offset="48%" stop-color="${accent}"/>
        <stop offset="100%" stop-color="${land}"/>
      </linearGradient>
    </defs>
    <rect width="2400" height="620" fill="url(#sky)"/>
    <rect y="620" width="2400" height="580" fill="url(#ground)"/>
    <path d="M0 610 C260 500 390 530 590 455 C780 382 910 460 1110 410 C1330 356 1510 430 1740 372 C1940 321 2120 424 2400 360 L2400 720 L0 720 Z" fill="#315844" opacity="0.92"/>
    <path d="M0 690 C300 642 520 700 760 650 C990 604 1210 684 1450 622 C1730 548 1970 646 2400 570 L2400 1200 L0 1200 Z" fill="#233c32" opacity="0.58"/>
    <path d="M0 868 C420 800 690 930 1060 835 C1370 755 1660 900 2400 790 L2400 1200 L0 1200 Z" fill="#6e7f62" opacity="0.72"/>
    <text x="1200" y="210" text-anchor="middle" font-family="Arial" font-size="78" font-weight="700" fill="rgba(255,255,255,0.9)">${title}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function svgPhotoDataUrl(title, color, accent) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="${accent}"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="760" fill="url(#bg)"/>
    <circle cx="930" cy="160" r="82" fill="rgba(255,255,255,0.35)"/>
    <path d="M0 520 C180 420 300 470 430 390 C590 292 740 420 890 330 C1020 252 1110 330 1200 290 L1200 760 L0 760 Z" fill="rgba(22,65,48,0.78)"/>
    <path d="M0 610 C240 560 450 640 720 565 C930 506 1050 590 1200 545 L1200 760 L0 760 Z" fill="rgba(255,255,255,0.2)"/>
    <text x="60" y="108" font-family="Arial" font-size="58" font-weight="800" fill="#ffffff">${title}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const seedPlaces = [
  {
    id: "patalpani-valley-view",
    title: "पातालपानी घाटी 360 व्यू",
    district: "Indore",
    category: "Waterfall",
    latitude: 22.505,
    longitude: 75.797,
    story:
      "पातालपानी के पास यह शांत घाटी व्यू-पॉइंट बारिश के बाद बहुत सुंदर दिखता है। यहां सुबह जल्दी पहुंचने पर भीड़ कम रहती है और पूरा इलाका अच्छे से दिखाई देता है।",
    history:
      "पातालपानी क्षेत्र मालवा के पठारी भू-भाग और स्थानीय जलधाराओं से जुड़ा है। यह स्थान इंदौर के आसपास प्रकृति पर्यटन का लोकप्रिय लेकिन अभी भी कई यात्रियों के लिए कम खोजा गया अनुभव देता है।",
    audioGuide:
      "आप पातालपानी घाटी के 360 दृश्य में हैं। सामने दिखती हरियाली, गहरी घाटी और बारिश के बाद बहते पानी की आवाज इस जगह को खास बनाती है। कृपया सुरक्षित दूरी बनाए रखें और सुबह जल्दी आने की कोशिश करें।",
    bestTime: "July to September",
    durationMinutes: 45,
    localFood: "इंदौर लौटते समय पोहा, जलेबी और स्थानीय नमकीन जरूर ट्राई करें।",
    safetyNote: "घाटी के किनारे और बारिश में पत्थरों पर विशेष सावधानी रखें।",
    accessibility: "मुख्य सड़क से पहुंच आसान है, लेकिन अंतिम व्यू-पॉइंट पर पैदल सावधानी चाहिए।",
    travelTip: "फिसलन वाले किनारों से दूरी रखें और बारिश में सावधानी रखें।",
    videoUrl: "/sample-guide-video.html",
    panoramaDataUrl: svgPanoramaDataUrl("Patalpani Valley", "#83cfff", "#536d50", "#9cb86e"),
    imageMime: "image/svg+xml",
    media: [
      svgPhotoDataUrl("Valley Edge", "#69b7d7", "#436b4a"),
      svgPhotoDataUrl("Monsoon Trail", "#8fcf83", "#2d5a42"),
    ],
  },
  {
    id: "tamia-satpura-hill-bend",
    title: "तामिया सतपुड़ा हिल बेंड",
    district: "Chhindwara",
    category: "Hill View",
    latitude: 22.344,
    longitude: 78.669,
    story:
      "तामिया के पास यह हिल बेंड सतपुड़ा की layered hills दिखाता है। यह जगह शांत है और MP के hidden hill tourism के लिए बहुत अच्छा example है।",
    history:
      "तामिया सतपुड़ा पर्वत श्रृंखला के पास स्थित है और छिंदवाड़ा क्षेत्र की प्राकृतिक पहचान का महत्वपूर्ण हिस्सा है। यहां की घाटियां और ऊंचे दृश्य बिंदु slow travel के लिए बहुत उपयुक्त हैं।",
    audioGuide:
      "तामिया हिल बेंड में आपका स्वागत है। यहां से सतपुड़ा की परतदार पहाड़ियां दिखती हैं। हवा शांत रहती है और sunrise या sunset के समय यह जगह बहुत cinematic लगती है।",
    bestTime: "October to February",
    durationMinutes: 60,
    localFood: "स्थानीय ढाबों पर दाल, रोटी और seasonal सब्जियां मिल जाती हैं।",
    safetyNote: "घुमावदार सड़क पर वाहन धीरे चलाएं और fog में extra caution रखें।",
    accessibility: "Road access अच्छा है, लेकिन कुछ viewpoints पर railing नहीं हो सकती।",
    travelTip: "सूर्योदय के समय visibility अच्छी रहती है।",
    videoUrl: "/sample-guide-video.html",
    panoramaDataUrl: svgPanoramaDataUrl("Tamia Hills", "#a7dcff", "#3e6d4c", "#739b5d"),
    imageMime: "image/svg+xml",
    media: [
      svgPhotoDataUrl("Satpura Layers", "#9fd2f0", "#396948"),
      svgPhotoDataUrl("Forest Bend", "#7ab36b", "#284d3b"),
    ],
  },
  {
    id: "bhimbetka-rock-shelter-trail",
    title: "भीमबेटका रॉक शेल्टर ट्रेल",
    district: "Raisen",
    category: "Heritage",
    latitude: 22.939,
    longitude: 77.613,
    story:
      "भीमबेटका की मुख्य caves के अलावा आसपास की walking trail भी काफी सुंदर है। Natural rock frames और forest corners इसे एक immersive heritage experience बनाते हैं।",
    history:
      "भीमबेटका UNESCO World Heritage Site है और यहां prehistoric rock paintings मिलती हैं। यह स्थान भारतीय उपमहाद्वीप में मानव जीवन और कला की बहुत पुरानी झलक दिखाता है।",
    audioGuide:
      "आप भीमबेटका रॉक शेल्टर ट्रेल पर हैं। इन चट्टानों में हजारों साल पुराने मानव जीवन और कला के संकेत मिलते हैं। हर shelter को धीरे-धीरे देखें और markings को नुकसान न पहुंचाएं।",
    bestTime: "November to February",
    durationMinutes: 90,
    localFood: "भोपाल या भीमबेटका route पर simple snacks और पानी पहले से carry करें।",
    safetyNote: "Rock art को touch न करें और marked path से बाहर न जाएं।",
    accessibility: "Walking trail moderate है; comfortable shoes जरूरी हैं।",
    travelTip: "गाइड लेना बेहतर रहेगा ताकि rock art का context समझ आए।",
    videoUrl: "/sample-guide-video.html",
    panoramaDataUrl: svgPanoramaDataUrl("Bhimbetka Trail", "#9bcbe8", "#8b644c", "#bd8358"),
    imageMime: "image/svg+xml",
    media: [
      svgPhotoDataUrl("Rock Shelter", "#c28a61", "#6f4937"),
      svgPhotoDataUrl("Heritage Trail", "#a9704f", "#2d5746"),
    ],
  },
  {
    id: "mandu-jahaz-mahal-story",
    title: "मांडू जहाज महल कहानी मार्ग",
    district: "Dhar",
    category: "Heritage",
    latitude: 22.3347,
    longitude: 75.3974,
    story:
      "मांडू का जहाज महल पानी के बीच खड़े ship जैसी संरचना के कारण अलग अनुभव देता है। यहां architecture, history और landscape एक साथ मिलते हैं।",
    history:
      "मांडू मालवा सल्तनत की राजधानी रहा है। जहाज महल का निर्माण जलाशयों के बीच किया गया था, जिससे यह बारिश के मौसम में floating palace जैसा दिखता है।",
    audioGuide:
      "मांडू के जहाज महल में आपका स्वागत है। कल्पना कीजिए कि बारिश में चारों ओर पानी है और यह महल एक जहाज जैसा दिख रहा है। यही इसकी सबसे प्रसिद्ध पहचान है।",
    bestTime: "August to February",
    durationMinutes: 75,
    localFood: "मांडू में स्थानीय मालवी snacks और चाय अच्छा विकल्प हैं।",
    safetyNote: "Monuments पर चढ़ना avoid करें और heritage rules follow करें।",
    accessibility: "मुख्य monument zone तक road access अच्छा है।",
    travelTip: "Rainy season में views best होते हैं, लेकिन umbrella carry करें।",
    videoUrl: "/sample-guide-video.html",
    panoramaDataUrl: svgPanoramaDataUrl("Mandu Palace", "#9dd5ff", "#7b7652", "#b58d5b"),
    imageMime: "image/svg+xml",
    media: [
      svgPhotoDataUrl("Jahaz Mahal", "#b8895a", "#486b5a"),
      svgPhotoDataUrl("Mandu Water View", "#83bbd4", "#7d8458"),
    ],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    create: {
      email: "demo@mpdarshan.in",
      name: "Demo Tourist",
      passwordHash,
      role: "TOURIST",
    },
    update: {},
    where: { email: "demo@mpdarshan.in" },
  });

  for (const place of seedPlaces) {
    const { media, ...placeData } = place;
    const { mapX, mapY } = projectToMap(place.latitude, place.longitude);
    await prisma.place.upsert({
      create: {
        ...placeData,
        authorId: user.id,
        imageSizeBytes: place.panoramaDataUrl.length,
        mapX,
        mapY,
      },
      update: {
        accessibility: place.accessibility,
        audioGuide: place.audioGuide,
        bestTime: place.bestTime,
        category: place.category,
        district: place.district,
        durationMinutes: place.durationMinutes,
        history: place.history,
        imageMime: place.imageMime,
        imageSizeBytes: place.panoramaDataUrl.length,
        latitude: place.latitude,
        localFood: place.localFood,
        longitude: place.longitude,
        mapX,
        mapY,
        panoramaDataUrl: place.panoramaDataUrl,
        safetyNote: place.safetyNote,
        story: place.story,
        title: place.title,
        travelTip: place.travelTip,
        videoUrl: place.videoUrl,
      },
      where: {
        id: place.id,
      },
    });

    await prisma.placeMedia.deleteMany({ where: { placeId: place.id } });
    await prisma.placeMedia.createMany({
      data: media.map((dataUrl, index) => ({
        caption: `${place.title} photo ${index + 1}`,
        dataUrl,
        mimeType: "image/svg+xml",
        placeId: place.id,
        sizeBytes: dataUrl.length,
        sortOrder: index,
        type: "PHOTO",
      })),
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Database seeded. Demo login: demo@mpdarshan.in / password123");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
