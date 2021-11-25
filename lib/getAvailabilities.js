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

  const addAvailabilityOnDay = (currDate, slots = []) => {
    availabilities[formatDate(currDate)] = slots;
  };

  const addAvailabilityOnNextDay = (currDate, slots = []) => {
    const incrementedDay = addDays(currDate, 1);
    newDateBooked = incrementedDay;
    availabilities[formatDate(newDateBooked)] = slots;
  };

  const formatDateToTimeSlot = (date) => {
    let timeHour = getHours(date);
    let timeMinutes =
      getMinutes(date) > 0 ? getMinutes(date) : "0".padEnd(2, "0");
    return `${timeHour}:${timeMinutes}`;
  };

  // build slots according to the available time slots possible
  const createSlots = (start, end) => {
    let availableTimeSlot = differenceInMinutes(parseISO(end), parseISO(start));

    const numberSlots = availableTimeSlot / SLOT_LENGTH;
    const startTime = parseISO(start);
    const timeSlots = [];

    for (let i = 0; i < numberSlots; i++) {
      const newTime = addMinutes(startTime, SLOT_LENGTH * i);
      timeSlots.push(formatDateToTimeSlot(newTime));
    }

    // console.log("timeSlots", timeSlots, numberSlots, availableTimeSlot);
    return timeSlots;
  };

  // no events registered
  if (events.length === 0) {
    addAvailabilityOnDay(date);
    for (let i = 0; i < NUMBER_OF_DAYS; i++) {
      addAvailabilityOnNextDay(newDateBooked);
    }
  } else {
    let slots = [];
    events.forEach((event) => {
      let freeSlot = differenceInMinutes(
        parseISO(event.ends_at),
        parseISO(event.starts_at)
      );

      if (freeSlot > 0) {
        const { starts_at, ends_at } = event;

        slots = createSlots(starts_at, ends_at);
      }
    });
    addAvailabilityOnDay(date, slots);

    console.log(
      typeof events[0].starts_at,
      events[0].starts_at,
      getHours(parseISO(events[0].starts_at)),
      getMinutes(parseISO(events[0].starts_at)),
      availabilities
    );
  }

  return availabilities;
};

// Please keep this default export as it is.
export default getAvailabilities;
