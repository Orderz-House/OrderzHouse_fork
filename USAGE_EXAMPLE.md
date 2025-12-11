# Freelancer Category Selector Usage Example

## Basic Usage

To use the new `FreelancerCategorySelector` component in any React application:

```jsx
import React from 'react';
import FreelancerCategorySelector from './components/register/FreelancerCategorySelector';

function RegistrationForm() {
  const [freelancerCategories, setFreelancerCategories] = React.useState({
    mainCategory: null,
    subCategories: []
  });

  const handleCategoryChange = (categoryData) => {
    setFreelancerCategories(categoryData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Use the category data in your form submission
    const formData = {
      // ... other form fields
      category_id: freelancerCategories.mainCategory?.id,
      sub_category_ids: freelancerCategories.subCategories.map(sc => sc.id)
    };
    
    console.log('Form Data:', formData);
    // Submit to your API
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other form fields */}
      
      <FreelancerCategorySelector onCategoryChange={handleCategoryChange} />
      
      <button type="submit">Register</button>
    </form>
  );
}
```

## Component Props

| Prop | Type | Description |
|------|------|-------------|
| `onCategoryChange` | Function | Callback function that receives the selected category data |

## Category Data Structure

The `onCategoryChange` callback receives an object with this structure:

```javascript
{
  mainCategory: {
    id: 1,
    name: "Web Development",
    description: "All courses and projects related to web development."
  },
  subCategories: [
    {
      id: 2,
      name: "Frontend Development",
      description: "Building user interfaces with HTML, CSS, and JavaScript"
    },
    {
      id: 3,
      name: "Backend Development",
      description: "Server-side development with Node.js, Python, etc."
    }
  ]
}
```

## Styling

The component uses Tailwind CSS classes for styling. Make sure your project has Tailwind CSS configured, or the component will still work but without the styled appearance.

## Integration with Existing Forms

The component is designed to integrate seamlessly with existing registration forms. Simply replace the old category selection UI with this component and handle the data through the callback function.

## Validation

The component handles validation internally:
- Prevents selection of more than 3 sub-categories
- Automatically resets sub-categories when main category changes
- Shows user-friendly error messages

## Customization

While the component comes with built-in styling, you can customize it by:
1. Modifying the Tailwind classes directly in the component
2. Wrapping it in a container with custom styles
3. Passing additional props for customization (though the current implementation doesn't support this)

## Error Handling

The component displays error messages in a banner at the top of the selector when:
- A user tries to select more than 3 sub-categories
- There are issues fetching categories from the API

These errors automatically disappear after 3 seconds or when the user takes corrective action.