import { knex } from "knex";
// Uncomment and use date-fns if you want.
import {
  format,
  addDays,
  differenceInMinutes,
  parseISO,
  getTime,
  getHours,
  getMinutes,
  addMinutes,
} from "date-fns";

// Please keep this named export as it is.
export const knexClient = knex({
  client: "sqlite3",
  connection: ":memory:",
  useNullAsDefault: true,
});

// Please keep this named export as it is.
export const migrate = () =>
  knexClient.schema.createTable("events", (table) => {
    table.increments();
    table.dateTime("starts_at").notNullable();
    table.dateTime("ends_at").notNullable();
    table.enum("kind", ["appointment", "opening"]).notNullable();
    table.boolean("weekly_recurring");
  });

const getAvailabilities = async (date) => {
  const events = await knexClient("events").select();
  const NUMBER_OF_DAYS = 6;
  const SLOT_LENGTH = 30;

  // date format YYYY/MM/DD
  const formatDate = (currDate) => format(currDate, "yyyy-MM-dd");

  let newDateBooked = date;
  const availabilities = {};
  const openings = [];
  const appointments = [];

  const addAvailabilityOnDay = (currDate, slots = []) => {
    const formattedDate = formatDate(currDate);

    if (availabilities[formattedDate]) {
      availabilities[formattedDate].push(...slots);
    } else {
      availabilities[formattedDate] = slots;
    }
  };

  // add availabilities for each day following the date
  const addAvailabilityOnNextDay = (currDate, slots = []) => {
    const incrementedDay = addDays(currDate, 1);
    newDateBooked = incrementedDay;

    availabilities[formatDate(newDateBooked)] = slots;
  };

  // from Date to HH:MM format. ex: new Date("2020-01-01 09:00") -> 9:00
  const formatDateToTimeSlot = (date) => {
    const timeHour = getHours(date);
    const timeMinutes =
      getMinutes(date) > 0 ? getMinutes(date) : "0".padEnd(2, "0");
    return `${timeHour}:${timeMinutes}`;
  };

  // build slots according to the available time slots possible
  const createTimeSlots = (start, end, eventKind) => {
    const slotSpace = eventKind === "opening" ? openings : appointments;
    const availableTimeSlot = differenceInMinutes(
      parseISO(end),
      parseISO(start)
    );

    const numberSlots = availableTimeSlot / SLOT_LENGTH;
    const startTime = parseISO(start);

    for (let i = 0; i < numberSlots; i++) {
      const newTime = addMinutes(startTime, SLOT_LENGTH * i);
      slotSpace.push(formatDateToTimeSlot(newTime));
    }

    const timeSlots =
      appointments.length === 0
        ? openings
        : openings.filter((timeSlot) => !appointments.includes(timeSlot));

    // console.log("timeSlots", { openings, appointments, timeSlots });
    return timeSlots;
  };

  // no events registered
  if (events.length === 0) {
    addAvailabilityOnDay(date);
    for (let i = 0; i < NUMBER_OF_DAYS; i++) {
      addAvailabilityOnNextDay(newDateBooked);
    }
  } else {
    console.log("events --------------", events);
    // parse different events to find available slots
    let timeSlots = [];
    events.forEach((event) => {
      const { starts_at, ends_at, kind } = event;
      timeSlots = createTimeSlots(starts_at, ends_at, kind);
    });

    addAvailabilityOnDay(date, timeSlots);

    // console.log("availabilities", availabilities);
  }

  return availabilities;
};

// Please keep this default export as it is.
export default getAvailabilities;
