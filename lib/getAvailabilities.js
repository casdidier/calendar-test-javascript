import { knex } from "knex";
// Uncomment and use date-fns if you want.
// import ... from "date-fns";

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
  // Implement your algorithm here. Create as many functions as you like, but no extra files please.
};

// Please keep this default export as it is.
export default getAvailabilities;
