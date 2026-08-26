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
    `Welcome to ${place.title} in the ${place.district} of SGSITS.`,
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
        text: `Start with the 360 panorama of ${place.title}. Look around to understand its entrances, nearby buildings, and campus context.`,
      },
      {
        heading: "History and significance",
        text: place.history,
      },
      {
        heading: "Campus experience",
        text: place.story,
      },
      {
        heading: "Visitor information",
        text: [
          place.bestTime ? `Best time: ${place.bestTime}` : "",
          place.travelTip ? `Visitor tip: ${place.travelTip}` : "",
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
        "Read the administrator's clicked campus-map point",
        "Map normalized campus coordinates into responsive screen space",
        "Rasterize a route from the Main Gate with DDA line drawing",
        "Animate a guide marker on a quadratic Bezier curve",
        "Apply translation, rotation, and scaling each animation frame",
      ],
      algorithms: [
        {
          name: "Coordinate Projection",
          detail:
            "Each administrator click is stored as normalized X/Y coordinates so markers remain aligned on the responsive campus image.",
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
