import getAvailabilities, {
  knexClient,
  migrate,
} from "../lib/getAvailabilities";

describe("getAvailabilities", () => {
  let availabilities;

  beforeAll(() => migrate());

  beforeEach(() => knexClient("events").truncate());

  afterAll(() => knexClient.destroy());

  describe("skeleton", () => {
    beforeAll(async () => {
      availabilities = await getAvailabilities(new Date("2020-01-01 00:00"));
    });

    it("returns an Object", () => {
      expect(typeof availabilities === "object").toBe(true);
      expect(Array.isArray(availabilities)).toBe(false);
    });

    it("key is a date string with format YYYY/MM/DD", () => {
      expect(Object.keys(availabilities)[0]).toEqual("2020-01-01");
    });

    it("value is an Array", () => {
      expect(Object.values(availabilities)[0]).toEqual([]);
    });

    it("returns the next seven days", () => {
      expect(Object.values(availabilities).length).toBe(7);
    });

    it("full flow", () => {
      expect(availabilities["2020-01-01"]).toEqual([]);
      expect(availabilities["2020-01-02"]).toEqual([]);
      expect(availabilities["2020-01-03"]).toEqual([]);
      expect(availabilities["2020-01-04"]).toEqual([]);
      expect(availabilities["2020-01-05"]).toEqual([]);
      expect(availabilities["2020-01-06"]).toEqual([]);
      expect(availabilities["2020-01-07"]).toEqual([]);
    });
  });

  // describe("openings", () => {
  //   it("one opening", async () => {
  //     await knexClient("events").insert([
  //       {
  //         kind: "opening",
  //         starts_at: new Date("2020-01-01 11:00").toISOString(),
  //         ends_at: new Date("2020-01-01 11:30").toISOString(),
  //       },
  //     ]);
  //     availabilities = await getAvailabilities(new Date("2020-01-01 00:00"));
  //     expect(availabilities["2020-01-01"]).toEqual(["11:00"]);
  //   });

  //   it("30 minutes slots", async () => {
  //     await knexClient("events").insert([
  //       {
  //         kind: "opening",
  //         starts_at: new Date("2020-01-01 11:00").toISOString(),
  //         ends_at: new Date("2020-01-01 12:00").toISOString(),
  //       },
  //     ]);
  //     availabilities = await getAvailabilities(new Date("2020-01-01 00:00"));
  //     expect(availabilities["2020-01-01"]).toEqual(["11:00", "11:30"]);
  //   });

  //   it("several openings on the same day", async () => {
  //     await knexClient("events").insert([
  //       {
  //         kind: "opening",
  //         starts_at: new Date("2020-01-01 11:00").toISOString(),
  //         ends_at: new Date("2020-01-01 12:00").toISOString(),
  //       },
  //       {
  //         kind: "opening",
  //         starts_at: new Date("2020-01-01 14:00").toISOString(),
  //         ends_at: new Date("2020-01-01 15:00").toISOString(),
  //       },
  //     ]);
  //     availabilities = await getAvailabilities(new Date("2020-01-01 00:00"));
  //     expect(availabilities["2020-01-01"]).toEqual([
  //       "11:00",
  //       "11:30",
  //       "14:00",
  //       "14:30",
  //     ]);
  //   });

  //   it("format", async () => {
  //     await knexClient("events").insert([
  //       {
  //         kind: "opening",
  //         starts_at: new Date("2020-01-01 09:00").toISOString(),
  //         ends_at: new Date("2020-01-01 09:30").toISOString(),
  //       },
  //       {
  //         kind: "opening",
  //         starts_at: new Date("2020-01-01 14:00").toISOString(),
  //         ends_at: new Date("2020-01-01 14:30").toISOString(),
  //       },
  //     ]);
  //     availabilities = await getAvailabilities(new Date("2020-01-01 00:00"));
  //     expect(availabilities["2020-01-01"]).toEqual(["9:00", "14:00"]);
  //   });
  // });

  // describe("appointments", () => {
  //   beforeEach(
  //     async () =>
  //       await knexClient("events").insert([
  //         {
  //           kind: "opening",
  //           starts_at: new Date("2020-01-01 09:00").toISOString(),
  //           ends_at: new Date("2020-01-01 10:00").toISOString(),
  //         },
  //       ])
  //   );

  //   it("an appointment of one slot", async () => {
  //     await knexClient("events").insert([
  //       {
  //         kind: "appointment",
  //         starts_at: new Date("2020-01-01 09:00").toISOString(),
  //         ends_at: new Date("2020-01-01 09:30").toISOString(),
  //       },
  //     ]);
  //     availabilities = await getAvailabilities(new Date("2020-01-01 00:00"));
  //     expect(availabilities["2020-01-01"]).toEqual(["9:30"]);
  //   });

  //   it("an appointment of several slots", async () => {
  //     await knexClient("events").insert([
  //       {
  //         kind: "appointment",
  //         starts_at: new Date("2020-01-01 09:00").toISOString(),
  //         ends_at: new Date("2020-01-01 10:00").toISOString(),
  //       },
  //     ]);
  //     availabilities = await getAvailabilities(new Date("2020-01-01 00:00"));
  //     expect(availabilities["2020-01-01"]).toEqual([]);
  //   });

  //   it("several appointments on the same day", async () => {
  //     await knexClient("events").insert([
  //       {
  //         kind: "appointment",
  //         starts_at: new Date("2020-01-01 09:00").toISOString(),
  //         ends_at: new Date("2020-01-01 09:30").toISOString(),
  //       },
  //       {
  //         kind: "appointment",
  //         starts_at: new Date("2020-01-01 09:30").toISOString(),
  //         ends_at: new Date("2020-01-01 10:00").toISOString(),
  //       },
  //     ]);
  //     availabilities = await getAvailabilities(new Date("2020-01-01 00:00"));
  //     expect(availabilities["2020-01-01"]).toEqual([]);
  //   });
  // });

  // describe("weekly recurring openings", () => {
  //   it("weekly recurring are taken into account day 1", async () => {
  //     await knexClient("events").insert([
  //       {
  //         kind: "opening",
  //         starts_at: new Date("2020-01-01 09:00").toISOString(),
  //         ends_at: new Date("2020-01-01 09:30").toISOString(),
  //         weekly_recurring: true,
  //       },
  //     ]);
  //     availabilities = await getAvailabilities(new Date("2020-01-01 00:00"));
  //     expect(availabilities["2020-01-01"]).toEqual(["9:00"]);
  //   });

  //   it("weekly recurring are recurring", async () => {
  //     await knexClient("events").insert([
  //       {
  //         kind: "opening",
  //         starts_at: new Date("2020-01-01 09:00").toISOString(),
  //         ends_at: new Date("2020-01-01 09:30").toISOString(),
  //         weekly_recurring: true,
  //       },
  //     ]);
  //     availabilities = await getAvailabilities(new Date("2020-01-08 00:00"));
  //     expect(availabilities["2020-01-08"]).toEqual(["9:00"]);
  //   });

  //   it("non weekly recurring are not recurring", async () => {
  //     await knexClient("events").insert([
  //       {
  //         kind: "opening",
  //         starts_at: new Date("2020-01-01 09:00").toISOString(),
  //         ends_at: new Date("2020-01-01 09:30").toISOString(),
  //         weekly_recurring: false,
  //       },
  //     ]);
  //     availabilities = await getAvailabilities(new Date("2020-01-08 00:00"));
  //     expect(availabilities["2020-01-08"]).toEqual([]);
  //   });
  // });
});
;
