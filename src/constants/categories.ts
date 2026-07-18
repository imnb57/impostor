import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Food & Drink',
    emoji: '🍕',
    words: [
      'Pizza', 'Sushi', 'Tacos', 'Pancakes', 'Ice Cream', 'Spaghetti',
      'Burger', 'Ramen', 'Chocolate', 'Popcorn', 'Dumplings', 'Caesar Salad',
      'Sandwich', 'Curry', 'Waffles', 'Donut', 'Hot Dog', 'Burrito',
      'Cheese', 'Tomato Soup', 'Steak', 'Croissant', 'Smoothie', 'Fried Chicken',
    ],
  },
  {
    id: 'animals',
    name: 'Animals',
    emoji: '🦁',
    words: [
      'Elephant', 'Penguin', 'Kangaroo', 'Dolphin', 'Octopus', 'Giraffe',
      'Owl', 'Shark', 'Panda', 'Snake', 'Butterfly', 'Crocodile',
      'Flamingo', 'Hedgehog', 'Wolf', 'Chameleon', 'Peacock', 'Sloth',
      'Jellyfish', 'Raccoon', 'Tiger', 'Bat', 'Seahorse', 'Gorilla',
    ],
  },
  {
    id: 'places',
    name: 'Places',
    emoji: '🏝️',
    words: [
      'Beach', 'Airport', 'Hospital', 'Cinema', 'Library', 'Casino',
      'Zoo', 'School', 'Gym', 'Supermarket', 'Space Station', 'Submarine',
      'Castle', 'Desert Island', 'Ski Resort', 'Circus', 'Museum', 'Night Club',
      'Farm', 'Pirate Ship', 'Restaurant', 'Train Station', 'Amusement Park', 'Haunted House',
    ],
  },
];

export function getCategory(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
