import { getClientFinancialOverview } from "./financialService.js";

export const getMyFinancialOverview = async (req, res) => {
  const clientId = req.token?.userId;

  try {
    const data = await getClientFinancialOverview(clientId);
    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("getMyFinancialOverview error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
