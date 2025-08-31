import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function saveMessage(chatId: string, role: string, content: string) {
  await pool.query(
    "INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)",
    [chatId, role, content]
  );
}

export async function createChat(userId: string, title: string) {
  const res = await pool.query(
    "INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING id",
    [userId, title]
  );
  return res.rows[0].id;
}
