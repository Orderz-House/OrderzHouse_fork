# Copywriting Test Component

This component implements a daily copywriting test feature for the freelancer platform.

## Features

1. **Daily Unique Tests**: Generates a new copywriting challenge every day
2. **Multiple Test Types**: 
   - Landing Page Copy
   - Social Media Copy
   - Ad Copy
   - Email Marketing Copy
   - Product Description
   - Blog Introduction
   - Branding/Tagline creation
3. **Industry Variation**: Tests cover different industries (SaaS, food, fashion, AI, health, etc.)
4. **Timer**: 1-hour time limit for each test
5. **Auto-Evaluation**: Automatic scoring based on 5 criteria
6. **Anti-Cheating Detection**: Identifies potentially AI-generated or copied content
7. **Pop-up Panel**: Accessible from any page across the site

## Implementation Details

### Component Structure
- `CopywritingTest.jsx`: Main component with all functionality
- `index.js`: Export file for easy importing

### Key Functions
- `generateDailyTest()`: Creates a new randomized test prompt
- `evaluateResponse()`: Scores user submissions across 5 criteria
- `detectCheating()`: Checks for suspicious patterns in submissions
- Timer functionality with localStorage persistence

### Evaluation Criteria
1. **Creativity Score** (0-10): Originality, uniqueness, hooks, persuasive techniques
2. **SEO Optimization Score** (0-10): Keyword quality, readability, structure
3. **Grammar & Spelling Score** (0-10): Correctness, clarity, sentence structure
4. **Structure & Flow Score** (0-10): Logical flow, organization, CTA clarity
5. **Tone & Targeting Score** (0-10): Audience fit, consistent tone

### Storage
- Uses localStorage to persist daily tests and user history
- Resets to a new test each calendar day

## Usage

Navigate to `/copywriting-test` route or click the clock icon in the bottom-right corner to access the pop-up panel.

## Integration Points

- Added to `App.jsx` as a protected route
- Linked in the navbar under the "EXPLORE" menu
- Available as a persistent pop-up panel across all site pages

## Future Improvements

1. Server-side storage of tests and results
2. More sophisticated anti-cheating algorithms
3. Detailed analytics and progress tracking
4. Community sharing of high-scoring submissions
5. Integration with user profiles and skill assessments