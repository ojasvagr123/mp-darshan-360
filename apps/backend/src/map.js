export const MP_BOUNDS = {
  north: 26.9,
  south: 21.08,
  east: 82.82,
  west: 74.02,
};

export function isInsideMadhyaPradesh(latitude, longitude) {
  return (
    latitude >= MP_BOUNDS.south &&
    latitude <= MP_BOUNDS.north &&
    longitude >= MP_BOUNDS.west &&
    longitude <= MP_BOUNDS.east
  );
}

export function projectToMap(latitude, longitude) {
  const x = ((longitude - MP_BOUNDS.west) / (MP_BOUNDS.east - MP_BOUNDS.west)) * 100;
  const y = ((MP_BOUNDS.north - latitude) / (MP_BOUNDS.north - MP_BOUNDS.south)) * 100;

  return {
    mapX: Number(Math.max(3, Math.min(97, x)).toFixed(3)),
    mapY: Number(Math.max(3, Math.min(97, y)).toFixed(3)),
  };
}
