# DailyEcho
Daily Echo is a web application that displays daily quotes, styled with elegance. The user can select categories of quotes: Abrahamic, Historical, Philosophical, Literary, or Random. User preference will be persisted in browser local storage across sessions. The application is deployed via Vercel using serverless API routing and integrates with MongoDB Atlas. Since Vercel times out API requests at 5 seconds, there are fallbacks to catch when those requests exceed that limit.

## Key Features

- **Daily Quotes from Different Categories:** My selection of the best quotes on motivation and self-reflection. It offers different moods and interests that could be catered to in just one dynamic user experience.

- **Natural Background:** An reflectve, natueal background to set an immersive atmosphere. It is hosted on Cloudinary.

- **Store Users' Preferences for Quote Categories:** The user will be able to personalize the experience by choosing their categories: Abrahamic, Historical, Philosophical, Literary, or Random. Which are stored locally. This personalizes the feature so that users will never see quotes from irrelevant categories.

- **Database Fallback With Local Quote:** The application will work seamlessly in conditions of no access to the database. It will only resort to the locally stored array of quotes.

- **Responsive design with modern UI:** It automatically adjusts with screen sizes and devices perfectly, showing clean typography, intuitive navigation, and thoughtfully designed UI components. Users can enjoy seamlessly going through both mobile and desktop versions.

- **Polished loading animation with smooth transitions:** The smooth transitions between contents are bridged with a well-crafted loading animation that adds so much to the user's experience. Those small things make it feel modern, really professional.

## Advice for Fresh Coders
When using Vercel for the first time, use the CLI. Way better to see the flaws at the moment.
