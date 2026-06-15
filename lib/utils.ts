/**
 * Helper to determine if a restaurant is currently open and return a localized message.
 * Supports weekly calendars with multiple shifts and overnight hours.
 */
export function getLiveStatusMessage(
  abertura?: string | null,
  fechamento?: string | null,
  horariosSemana?: any
): { isOpen: boolean; message: string } {
  try {
    const now = new Date();
    // Convert to America/Sao_Paulo timezone to ensure consistency between server and client
    const spTimeString = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
    const spDate = new Date(spTimeString);

    const dayIndex = spDate.getDay(); // 0 = Sunday, 1 = Monday, ...
    const daysMap = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
    const currentDayName = daysMap[dayIndex];

    const currentHour = spDate.getHours();
    const currentMinute = spDate.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMinute;

    // 1. If we have weekly hours, use them
    if (horariosSemana && typeof horariosSemana === 'object') {
      const dayConfig = horariosSemana[currentDayName];
      if (dayConfig) {
        if (dayConfig.aberto === false) {
          // Find when it opens next
          const nextDayIndex = (dayIndex + 1) % 7;
          const nextDayName = daysMap[nextDayIndex];
          const nextDayConfig = horariosSemana[nextDayName];
          let nextOpenMsg = "";
          
          if (nextDayConfig && nextDayConfig.aberto && nextDayConfig.turnos?.length > 0) {
            const dayPretty = nextDayName === "terca" ? "terça" : nextDayName === "sabado" ? "sábado" : nextDayName;
            nextOpenMsg = ` (abre ${dayPretty} às ${nextDayConfig.turnos[0].abertura})`;
          }
          
          const dayPrettyCurrent = currentDayName === "segunda" ? "segundas" : currentDayName === "terca" ? "terças" : currentDayName;
          return {
            isOpen: false,
            message: `Fechado às ${dayPrettyCurrent}${nextOpenMsg}`
          };
        }

        if (dayConfig.aberto === true && dayConfig.turnos && dayConfig.turnos.length > 0) {
          // Check each shift
          for (const turno of dayConfig.turnos) {
            const [hA, mA] = turno.abertura.split(':').map(Number);
            const [hF, mF] = turno.fechamento.split(':').map(Number);

            const openTimeVal = hA * 60 + mA;
            let closeTimeVal = hF * 60 + mF;

            let isShiftOpen = false;
            if (closeTimeVal < openTimeVal) {
              isShiftOpen = currentTimeVal >= openTimeVal || currentTimeVal < closeTimeVal;
            } else {
              isShiftOpen = currentTimeVal >= openTimeVal && currentTimeVal < closeTimeVal;
            }

            if (isShiftOpen) {
              return {
                isOpen: true,
                message: `Aberto agora (fecha às ${turno.fechamento})`
              };
            }
          }

          // Closed, check if there's a later shift today, or next open day
          let nextShiftToday: any = null;
          for (const turno of dayConfig.turnos) {
            const [hA, mA] = turno.abertura.split(':').map(Number);
            const openTimeVal = hA * 60 + mA;
            if (openTimeVal > currentTimeVal) {
              if (!nextShiftToday || openTimeVal < (Number(nextShiftToday.abertura.split(':')[0]) * 60 + Number(nextShiftToday.abertura.split(':')[1]))) {
                nextShiftToday = turno;
              }
            }
          }

          if (nextShiftToday) {
            return {
              isOpen: false,
              message: `Fechado no momento (reabre às ${nextShiftToday.abertura})`
            };
          }

          // Else find when it opens tomorrow or next days
          for (let i = 1; i <= 7; i++) {
            const checkIndex = (dayIndex + i) % 7;
            const checkDayName = daysMap[checkIndex];
            const checkConfig = horariosSemana[checkDayName];
            if (checkConfig && checkConfig.aberto && checkConfig.turnos?.length > 0) {
              const dayPretty = checkDayName === "terca" ? "terça" : checkDayName === "sabado" ? "sábado" : checkDayName;
              return {
                isOpen: false,
                message: `Fechado (abre ${dayPretty} às ${checkConfig.turnos[0].abertura})`
              };
            }
          }
        }
      }
    }

    // 2. Fallback to daily opening/closing hours
    if (!abertura || !fechamento) {
      return { isOpen: true, message: "Aberto" };
    }

    const [hA, mA] = abertura.split(':').map(Number);
    const [hF, mF] = fechamento.split(':').map(Number);

    const openTimeVal = hA * 60 + mA;
    let closeTimeVal = hF * 60 + mF;

    let isOpen = false;
    if (closeTimeVal < openTimeVal) {
      isOpen = currentTimeVal >= openTimeVal || currentTimeVal < closeTimeVal;
    } else {
      isOpen = currentTimeVal >= openTimeVal && currentTimeVal < closeTimeVal;
    }

    if (isOpen) {
      return { isOpen: true, message: `Aberto agora (fecha às ${fechamento})` };
    } else {
      return { isOpen: false, message: `Fechado no momento (abre às ${abertura})` };
    }
  } catch (err) {
    console.error("Error parsing opening hours:", err);
    return { isOpen: true, message: "Aberto" }; // Default to open in case of formatting errors
  }
}

/**
 * Helper to determine if a restaurant is currently open based on local system time.
 */
export function isRestaurantOpen(
  abertura?: string | null,
  fechamento?: string | null,
  horariosSemana?: any
): boolean {
  return getLiveStatusMessage(abertura, fechamento, horariosSemana).isOpen;
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
