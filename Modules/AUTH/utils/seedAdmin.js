const User = require("../../Users/users.model");

const seedAdmin = async () => {
  try {
    console.log("[SEED] Checking admin...");

    const adminExists = await User.findOne({ role: "ADMIN" });

    if (adminExists) {
      console.log("[SEED] Admin already exists");
      return;
    }

    const admin = new User({
      name: "Admin",
      email: "admin@supplychain.com",
      password: "Admin123",
      role: "ADMIN",
    });

    await admin.save();

    console.log("[SEED] Admin created successfully");
  } catch (error) {
    console.error("[SEED] Failed to seed admin user:", error.message);
  }
};

module.exports = seedAdmin;
