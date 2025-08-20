import cron from "node-cron";
import Device from "../models/Device.model.js";

const deactivateInactiveDevices = () => {
  console.log("Cron job initialized"); 

  cron.schedule("0 * * * *", async () => {
    console.log("Checking for inactive devices...");

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); 

    const result = await Device.updateMany(
      {
        $or: [
          { last_active_at: { $lt: cutoff } },
          { last_active_at: null } 
        ],
        status: "active"
      },
      { status: "inactive" }
    );

    console.log(`Deactivated ${result.modifiedCount} inactive devices`);
  });
};

export { deactivateInactiveDevices };