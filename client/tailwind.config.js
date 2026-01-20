/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#FFD700", // Gold
                secondary: "#B8860B", // Dark Goldenrod (hover states)
                dark: "#0a0a0a", // Deep Black
                card: "#121212", // Slightly lighter black for cards
                glass: "rgba(255, 255, 255, 0.05)",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
