import PusherClient from "pusher-js";

if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
  // Check if running on the server (e.g., during build) and allow missing client vars
  if (typeof window === 'undefined') {
    console.warn("Pusher client variables not found, but running on server. Skipping client initialization.");
  } else {
    throw new Error("Missing Pusher client environment variables (NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER)");
  }
}

// Conditional initialization to prevent errors during server-side rendering/build
export const pusherClient = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER)
  ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth', 
    })
  : null; // Set to null or a mock object on the server 