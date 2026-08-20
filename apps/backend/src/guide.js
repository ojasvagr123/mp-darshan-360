export function makeDataUrl(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
}

export function normalizeVideoUrl(url) {
  if (!url) {
    return null;
  }

  const value = String(url).trim();

  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value, "http://localhost");
    const host = parsed.hostname.replace("www.", "");

    if (host === "youtube.com" && parsed.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }

    if (host === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
    }

    return value;
  } catch {
    return value.startsWith("/") ? value : null;
  }
}

export function buildAudioGuide(place) {
  if (place.audioGuide?.trim()) {
    return place.audioGuide.trim();
  }

  return [
    `Welcome to ${place.title} in ${place.district}.`,
    place.story,
    place.history,
    place.bestTime ? `Best time to visit is ${place.bestTime}.` : "",
    place.travelTip ? `Traveller tip: ${place.travelTip}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildGuide(place) {
  const photos = place.media?.filter((item) => item.type === "PHOTO") ?? [];
  const audioGuide = buildAudioGuide(place);

  return {
    audioGuide,
    chapters: [
      {
        heading: "पहला दृश्य",
        text: `Start with the 360 panorama of ${place.title}. Notice the terrain, approach route, and nearby natural or heritage details.`,
      },
      {
        heading: "इतिहास और महत्व",
        text: place.history,
      },
      {
        heading: "यात्रा अनुभव",
        text: place.story,
      },
      {
        heading: "यात्रा तैयारी",
        text: [
          place.bestTime ? `Best time: ${place.bestTime}` : "",
          place.travelTip ? `Travel tip: ${place.travelTip}` : "",
          place.safetyNote ? `Safety: ${place.safetyNote}` : "",
          place.accessibility ? `Accessibility: ${place.accessibility}` : "",
        ]
          .filter(Boolean)
          .join(" • "),
      },
    ],
    galleryCount: photos.length,
    map: {
      latitude: place.latitude,
      longitude: place.longitude,
      mapX: place.mapX,
      mapY: place.mapY,
    },
    graphics: {
      projectionFormula:
        "x = ((longitude - west) / (east - west)) * 100; y = ((north - latitude) / (north - south)) * 100",
      selectedPoint: {
        latitude: place.latitude,
        longitude: place.longitude,
        mapX: place.mapX,
        mapY: place.mapY,
      },
      pipeline: [
        "Read tourist latitude and longitude",
        "Project world coordinates into 2D MP map space",
        "Rasterize route pixels with DDA line drawing",
        "Animate a guide marker on a quadratic Bezier curve",
        "Apply translation, rotation, and scaling each animation frame",
      ],
      algorithms: [
        {
          name: "Coordinate Projection",
          detail:
            "The backend converts real latitude-longitude into normalized 2D screen coordinates so every upload lands at the correct relative map position.",
        },
        {
          name: "DDA Line Drawing",
          detail:
            "The frontend calculates small route pixels between Bhopal and the selected destination using Digital Differential Analyzer increments.",
        },
        {
          name: "Bezier Path Animation",
          detail:
            "The moving tourism marker follows a quadratic Bezier curve, creating a smooth animated travel path.",
        },
        {
          name: "2D Transformations",
          detail:
            "Each frame applies translate, rotate, and scale operations to the animated marker using an affine transform matrix.",
        },
        {
          name: "Frame Rendering",
          detail:
            "Canvas requestAnimationFrame redraws the map, grid, route, and animated marker for a browser-friendly graphics loop.",
        },
      ],
    },
    media: {
      gallery: photos,
      panorama: {
        dataUrl: place.panoramaDataUrl,
        mimeType: place.imageMime,
      },
      videoUrl: place.videoUrl,
    },
    title: place.title,
    totalDurationMinutes: place.durationMinutes,
  };
}
