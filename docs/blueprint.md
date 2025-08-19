# **App Name**: ChronoGrid

## Core Features:

- Input Collection: Accept names and dates of birth (DOB) for a group of people, with a default group size of 5. Names and DOBs are initially empty.
- Age Calculation: Calculate the age of each person based on their DOB. Supports date formats: mm/dd/yyyy, mm/dd/yy, and yyyy-mm-dd.
- Age Display: Display the age of the person next to their name in parenthesis within the grid.
- Age Distance Calculation: Calculate the age distance between each pair of people. The age distance is the absolute difference in their ages.
- Age Distance Grid: Generate a grid displaying the age distances between each pair of people, similar to the provided 'distancegrid.jpg' structure. Use the person's name instead of city names and display the age distance as the grid values. Adjust grid size based on input.
- Input via Text Box: Allow input from a text box on the screen.  Handles invalid and missing input from the user to prevent UI failure. Provide real-time validation error messages to guide users.
- Affiliation Finder: Tool for identifying common patterns in entered birth dates to recommend group affiliations for the user, if any exist. Show age bracket categories using the AI "tool".

## Style Guidelines:

- Primary color: Light lavender (#E6E6FA) to evoke a sense of calmness and nostalgia, relating to memories and timelines.
- Background color: Very light gray (#F5F5F5) to provide a neutral and clean backdrop, ensuring readability and focus on the grid data.
- Accent color: Soft blue (#A9D0F5) to highlight interactive elements and important age differences, creating a visually engaging experience.
- Body and headline font: 'Inter' sans-serif font, for a clean and modern aesthetic that ensures readability across various screen sizes.
- Responsive design that adjusts to the display area available, ensuring it works seamlessly on different device sizes, providing a consistent user experience.
- Use simple and clear icons for input fields and validation messages.
- Subtle animations when calculating and displaying age distances, providing visual feedback to the user.