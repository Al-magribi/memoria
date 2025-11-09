import { Router } from "express";
import { verify } from "../middlewares/Verify.js";
import Notif from "../schema/NotifSchema.js";

const router = Router();

router.get("/get-notif", verify(), async (req, res) => {
  try {
    const notifications = await Notif.find({ recipient: req.user.id })
      .populate("sender", "firstName lastName fullName avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.patch("/read-notif/:id", verify(), async (req, res) => {
  try {
    await Notif.findByIdAndUpdate(req.params.id, { read: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-notif/:id", verify(), async (req, res) => {
  try {
    await Notif.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/read-all-notif", verify(), async (req, res) => {
  try {
    await Notif.updateMany({ recipient: req.user.id }, { read: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
