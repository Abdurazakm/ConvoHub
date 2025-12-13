import db from "../config/db.js";

export async function savePublicMessage(room, sender, message) {
  await db.execute(
    "INSERT INTO public_messages (room, sender, message) VALUES (?, ?, ?)",
    [room, sender, message]
  );
}

export async function savePrivateMessage(sender, receiver, message) {
  await db.execute(
    "INSERT INTO private_messages (sender, receiver, message) VALUES (?, ?, ?)",
    [sender, receiver, message]
  );
}
