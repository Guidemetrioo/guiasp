/**
 * Helper to determine if a restaurant is currently open based on local system time.
 * Handles normal hours (e.g., 12:00 - 22:00) and night hours (e.g., 18:00 - 02:00).
 */
export function isRestaurantOpen(abertura?: string | null, fechamento?: string | null): boolean {
  if (!abertura || !fechamento) return true;

  try {
    const now = new Date();
    // Convert to America/Sao_Paulo timezone to ensure consistency between server and client
    const spTimeString = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
    const spDate = new Date(spTimeString);

    const currentHour = spDate.getHours();
    const currentMinute = spDate.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMinute;

    const [hA, mA] = abertura.split(':').map(Number);
    const [hF, mF] = fechamento.split(':').map(Number);

    const openTimeVal = hA * 60 + mA;
    let closeTimeVal = hF * 60 + mF;

    if (closeTimeVal < openTimeVal) {
      // Overnight schedule (e.g. 18:00 to 02:00)
      return currentTimeVal >= openTimeVal || currentTimeVal < closeTimeVal;
    } else {
      // Standard schedule (e.g. 12:00 to 22:00)
      return currentTimeVal >= openTimeVal && currentTimeVal < closeTimeVal;
    }
  } catch (err) {
    console.error("Error parsing opening hours:", err);
    return true; // Default to open in case of formatting errors
  }
}

/**
 * Sorts restaurants by open/closed status (open first) and then by distance (closest first).
 */
export function sortRestaurants<T>(
  items: T[],
  getRestaurantData: (item: T) => {
    horario_abertura?: string | null;
    horario_fechamento?: string | null;
    distancia_km?: number | null;
  }
): T[] {
  return [...items].sort((a, b) => {
    const dataA = getRestaurantData(a);
    const dataB = getRestaurantData(b);

    const openA = isRestaurantOpen(dataA.horario_abertura, dataA.horario_fechamento);
    const openB = isRestaurantOpen(dataB.horario_abertura, dataB.horario_fechamento);

    // 1. Sort by open first
    if (openA && !openB) return -1;
    if (!openA && openB) return 1;

    // 2. Sort by distance ascending (closest first)
    const distA = dataA.distancia_km ?? 999;
    const distB = dataB.distancia_km ?? 999;
    return distA - distB;
  });
}
