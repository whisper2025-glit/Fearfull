
import { useState } from "react";

const categories = [
  { id: "hot", label: "Hot" },
  { id: "for-you", label: "For You" },
  { id: "anime", label: "Anime" },
  { id: "romance", label: "Romance" },
];

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`category-tab ${
            activeCategory === category.id ? "active" : ""
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
