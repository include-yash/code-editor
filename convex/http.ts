import { WebhookEvent } from "@clerk/nextjs/server";
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
    path: "/clerk-webhook",
    method: "POST",

    handler: httpAction(async (ctx, request) => {
        // Ensure webhook secret is set
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("Clerk webhook secret is not set.");
            return new Response("Internal server error", { status: 500 });
        }

        // Retrieve Svix headers
        const svix_id = request.headers.get("svix-id");
        const svix_signature = request.headers.get("svix-signature");
        const svix_timestamp = request.headers.get("svix-timestamp");

        if (!svix_id || !svix_signature || !svix_timestamp) {
            console.warn("Missing Svix headers");
            return new Response("Invalid request", { status: 400 });
        }

        // Read request payload
        let payload;
        try {
            payload = await request.json();
        } catch (error) {
            console.error("Error parsing JSON payload:", error);
            return new Response("Invalid JSON", { status: 400 });
        }

        const body = JSON.stringify(payload);
        console.log("Received Webhook Payload:", body);

        // Verify webhook signature
        const wh = new Webhook(webhookSecret);
        let evt: WebhookEvent;
        try {
            evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-signature": svix_signature,
                "svix-timestamp": svix_timestamp,
            }) as WebhookEvent;
        } catch (error) {
            console.error("Webhook verification failed:", error);
            return new Response("Invalid request", { status: 400 });
        }

        console.log("Webhook verified successfully:", evt.type);

        // Process user.created event
        if (evt.type === "user.created") {
            const { id, email_addresses, first_name, last_name } = evt.data;

            if (!id || !email_addresses?.length) {
                console.warn("Invalid user data received:", evt.data);
                return new Response("Invalid user data", { status: 400 });
            }

            const email = email_addresses[0].email_address;
            const name = `${first_name || ""} ${last_name || ""}`.trim();

            console.log("Saving user to Convex DB:", { id, email, name });

            try {
                await ctx.runMutation(api.users.syncUser, {
                    userId: id,
                    email: email,
                    name: name,
                });

                console.log("User saved successfully to Convex");
            } catch (error) {
                console.error("Error saving user to Convex:", error);
                return new Response("Error saving user", { status: 500 });
            }
        }

        return new Response("Webhook processed successfully", { status: 200 });
    }),
});

export default http;
