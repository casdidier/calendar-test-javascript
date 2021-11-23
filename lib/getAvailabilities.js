import { knex } from "knex";
// Uncomment and use date-fns if you want.
import {format, addDays} from "date-fns";

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
  const NUMBER_OF_DAYS = 8;

  // date format YYYY/MM/DD
  const formatDate = (date) => format(date, "yyyy-MM-dd")

  let newDateBooked = date;

  const availabilities = {
    [formatDate(date)]: []
  };

  const addAvailabilityOnNextDay = (date) => {
    const incrementedDay = addDays(date, 1);
    newDateBooked = incrementedDay;
    availabilities[formatDate(newDateBooked)] = [];
  }

  if (events.length === 0) {
  for (let i = 0; i < NUMBER_OF_DAYS; i++) {
    addAvailabilityOnNextDay(date);
  }
  }

  console.log('availabilities', availabilities);
  return availabilities;
};

// Please keep this default export as it is.
export default getAvailabilities;
