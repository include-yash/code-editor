import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
    args: {
        userId: v.string(),
        email: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        console.log("🔍 Checking if user exists:", args.userId);

        // Ensure we are using the correct table reference
        const existingUser = await ctx.db
            .query("users")  // If this fails, try ctx.db.table("users")
            .filter(q => q.eq(q.field("userId"), args.userId))
            .first();

        if (existingUser) {
            console.log("✅ User already exists, skipping insert.");
            return;
        }

        console.log("📝 Inserting new user:", args);

        try {
            await ctx.db.insert("users", {
                userId: args.userId,
                email: args.email,
                name: args.name,
                isPro: false, // Default value
            });
            console.log("User inserted successfully!");
        } catch (error) {
            console.error("Error inserting user into Convex:", error);
            throw new Error("Database insert failed");
        }
    }
});

export const getUser = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        if(!args.userId) return null;

        const user = await ctx.db
        .query("users")
        .filter(q => q.eq(q.field("userId"), args.userId))
        .first();

        if(!user) return null;
        return user;
    },
})
