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
        const startTime = parseISO(events[0].starts_at);

        let hour = getHours(startTime);
        let minutes =
          getMinutes(startTime) > 0
            ? getMinutes(startTime)
            : "0".padEnd(2, "0");

        let timeSlot = `${hour}:${minutes}`;

        slots.push(timeSlot);
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
