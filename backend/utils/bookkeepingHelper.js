import BookkeepingEntry from "../models/BookkeepingEntry.js";

/**
 * Upserts an automated BookkeepingEntry for a given referenceId and userId.
 * Guarantees idempotency — calling multiple times with the same referenceId will update
 * the existing record rather than creating duplicates.
 */
export const upsertAutomatedBookkeepingEntry = async ({
  userId,
  date,
  description,
  category,
  amount,
  type,
  referenceId
}) => {
  if (!userId || !referenceId || !amount || !description) {
    return null;
  }

  const parsedAmount = Math.abs(parseFloat(amount));
  if (isNaN(parsedAmount)) return null;

  const entryType = (type && type.toString().toLowerCase() === "income") ? "income" : "expense";
  const entryDate = date ? new Date(date) : new Date();
  const validDate = isNaN(entryDate.getTime()) ? new Date() : entryDate;

  const filter = {
    userId,
    referenceId
  };

  const update = {
    userId,
    date: validDate,
    description,
    category: category || "General",
    amount: parsedAmount,
    type: entryType,
    referenceId,
    isAutomated: true
  };

  const entry = await BookkeepingEntry.findOneAndUpdate(filter, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  });

  return entry;
};

/**
 * Removes automated BookkeepingEntry by referenceId and userId.
 */
export const removeAutomatedBookkeepingEntry = async ({ userId, referenceId }) => {
  if (!userId || !referenceId) return null;
  return await BookkeepingEntry.deleteMany({ userId, referenceId });
};
