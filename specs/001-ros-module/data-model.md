# Data Model: Module 1 — The Robotic Nervous System (ROS 2)

## Content Structure

### Chapter Entity
- **Name**: String (e.g., "Chapter 1: ROS 2 Foundations")
- **Description**: String (overview of chapter content)
- **Learning Objectives**: Array<String> (what students will learn)
- **Pages**: Array<Page> (associated pages in the chapter)
- **Order**: Integer (sequence in the module)

### Page Entity
- **Title**: String (page title)
- **Slug**: String (URL-friendly identifier)
- **Content**: String (Markdown content)
- **Chapter**: Chapter (parent chapter reference)
- **Navigation Order**: Integer (order within chapter)
- **Prerequisites**: Array<String> (knowledge needed before reading)
- **Learning Outcomes**: Array<String> (what student should know after reading)

### Code Example Entity
- **Title**: String (description of the example)
- **Language**: String (programming language)
- **Code**: String (actual code content)
- **Associated Page**: Page (which page this example belongs to)
- **Purpose**: String (what concept the example demonstrates)
- **Difficulty Level**: Enum ("beginner", "intermediate", "advanced")

### Concept Entity
- **Name**: String (e.g., "Node", "Topic", "Service")
- **Definition**: String (clear definition)
- **Related Concepts**: Array<Concept> (connections to other concepts)
- **Examples**: Array<Code Example> (practical examples)
- **Importance Level**: Enum ("foundational", "important", "advanced")

## Relationships
- Chapter contains multiple Pages
- Page contains multiple Code Examples
- Page covers multiple Concepts
- Concept can appear in multiple Pages
- Code Example belongs to one Page

## Validation Rules
- Each Chapter must have at least one Page
- Each Page must have a unique slug within its Chapter
- Each Code Example must have a valid programming language designation
- Learning objectives must be specific and measurable
- Prerequisites must be satisfied before accessing advanced content

## State Transitions
- Content draft → reviewed → published (for editorial workflow)
- Difficulty assessment may be updated based on student feedback