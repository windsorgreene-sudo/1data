## Project Summary
Beam Server is a high-performance infrastructure platform offering ultra-fast hosting, secure cloud servers, global proxies, and automated deployment solutions. It features a premium "Deep Space" aesthetic with electric cyan and neon purple accents, leveraging modern web technologies for a smooth, immersive user experience.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion (animations), Lenis (smooth scroll), Shadcn UI
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Backend/Auth**: Supabase
- **Icons**: Lucide React
- **Fonts**: Space Grotesk (headings), Instrument Sans (body)

## Architecture
- `src/components`: UI components, layout sections, and specialized visuals (e.g., ThreeGlobe)
- `src/pages`: Main application routes (Home, About, Pricing, etc.)
- `src/lib`: Utility functions and shared logic
- `src/integrations/supabase`: Supabase client and hooks
- `src/visual-edits`: Specialized messenger for Orchids Visual Edits

## User Preferences
- **Theme**: Always use a dark "Deep Space" theme with glassmorphism and neon accents.
- **Typography**: Space Grotesk for headings, Instrument Sans for body text.
- **Motion**: Use staggered reveal animations (animation-delay) and smooth scrolling (Lenis).
- **Performance**: Prioritize lazy loading for routes and optimized asset delivery.

## Project Guidelines
- **No Comments**: Do not add comments to code unless explicitly requested.
- **Consistency**: Mimic the existing "Beam Server Design System" for all new components.
- **Visual Edits**: Maintain compatibility with the `orchids-visual-edits` loader and messenger.
- **Environment**: Use relative URLs for client-side API calls to ensure compatibility with the web preview iframe.

## Common Patterns
- **Page Transitions**: Wrap page content in the `PageTransition` component.
- **Interactive Elements**: Use `hover-smooth-scale`, `card-smooth`, and `btn-smooth` for micro-interactions.
- **Staggered Reveals**: Apply the `stagger-animation` class to containers for sequential entry animations.