const test = require("node:test");
const assert = require("node:assert/strict");
const { NotificationSchema } = require("../src/schemas/notification.schema");

const validNotification = {
  type: "email",
  to: "test@example.com",
  subject: "  Hello  ",
  message: "  First line\nSecond line  ",
};

test("accepts a valid email notification without altering its content", () => {
  const result = NotificationSchema.safeParse(validNotification);
  assert.equal(result.success, true);
  assert.deepEqual(result.data, validNotification);
});

test("rejects missing or invalid notification fields", () => {
  const cases = [
    { type: "sms" },
    { to: "not-an-email" },
    { to: undefined },
    { subject: undefined },
    { subject: "" },
    { subject: " \t\n" },
    { subject: null },
    { message: undefined },
    { message: "" },
    { message: " \t\n" },
    { message: 42 },
  ];

  for (const changes of cases) {
    const result = NotificationSchema.safeParse({ ...validNotification, ...changes });
    assert.equal(result.success, false, `Expected rejection for ${JSON.stringify(changes)}`);
  }
});

test("rejects requests without an object body", () => {
  for (const body of [undefined, null, "text", []]) {
    assert.equal(NotificationSchema.safeParse(body).success, false);
  }
});
