import mysql from "mysql2/promise";

// MySQL への接続設定（金庫番の連絡先）
const pool = mysql.createPool({
  host: "localhost",      // 金庫番はこのPC上にいる
  user: "root",           // 管理者ユーザー
  password: "",           // パスワードなし（開発用）
  database: "tuitta",     // 使うデータベース名
  waitForConnections: true,
  connectionLimit: 10,    // 同時に最大10人まで金庫番に話しかけられる
});

export default pool;
