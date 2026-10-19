import bcrypt from "bcryptjs";
const pw = process.argv[2];
if (!pw) {
  console.log('Dùng: node scripts/hash.mjs "matkhau"');
  process.exit(1);
}
const hash = bcrypt.hashSync(pw, 10);
console.log("\nHash gốc:\n" + hash);
console.log(
  "\nDán vào .env.local (đã escape $):\nEDIT_PASSWORD_HASH=" +
    hash.replace(/\$/g, "\\$") +
    "\n",
);
