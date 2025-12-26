# Chapter 2: Language-to-Plan

## Introduction

This chapter explores how Large Language Models (LLMs) can generate complex action sequences from natural language commands. Students will learn how to process natural language input and generate appropriate ROS 2 action sequences that achieve requested goals.

## Learning Objectives

By the end of this chapter, you will be able to:

- Understand how LLMs process natural language commands
- Generate action sequences from complex commands
- Implement intent detection and entity extraction
- Handle ambiguous or complex commands
- Apply cognitive planning concepts to robotics

## Prerequisites

- Understanding of Chapter 1: Voice-to-Action concepts
- Basic knowledge of ROS 2 actions and services
- Familiarity with natural language processing concepts

## Table of Contents

1. [Language-to-Plan Overview](#language-to-plan-overview)
2. [LLM Processing for Natural Language](#llm-processing-for-natural-language)
3. [Intent Detection and Entity Extraction](#intent-detection-and-entity-extraction)
4. [Natural Language Command Schema](#natural-language-command-schema)
5. [Action Sequence Generation](#action-sequence-generation)
6. [Cognitive Planning Concepts](#cognitive-planning-concepts)
7. [Practical Examples](#practical-examples)
8. [Exercises](#exercises)

## Language-to-Plan Overview

The language-to-plan pipeline transforms natural language commands into executable action sequences. This is the cognitive planning aspect of VLA systems that enables complex task execution.

### Key Components

- **Natural Language Parser**: Interprets the user's command
- **Intent Detector**: Identifies the main goal
- **Entity Extractor**: Identifies objects, locations, and parameters
- **Action Planner**: Generates the sequence of actions
- **Context Manager**: Maintains state and context

### Process Flow

1. **Input Processing**: Receive and parse natural language command
2. **Intent Analysis**: Determine the primary goal
3. **Entity Recognition**: Extract relevant objects, locations, parameters
4. **Planning**: Generate action sequence to achieve the goal
5. **Validation**: Verify the plan is executable
6. **Output**: Return ROS 2 action sequence

## LLM Processing for Natural Language

Large Language Models excel at understanding and processing natural language commands. They can handle complex, multi-step requests and provide structured outputs.

### Approaches to LLM Integration

1. **Direct API Calls**: Using services like OpenAI GPT, Anthropic Claude
2. **Open Source Models**: Using models like Llama, Mistral, or specialized robotics models
3. **Fine-tuned Models**: Custom models trained on robotics-specific data

### Key Capabilities

- **Natural Language Understanding**: Interpret complex, ambiguous commands
- **Context Awareness**: Understand commands in context of previous interactions
- **Multi-step Planning**: Generate sequences for complex tasks
- **Error Recovery**: Handle ambiguous or impossible commands gracefully

### Example Implementation

```python
# Example of LLM-based command processing
import openai
from typing import Dict, List

class LLMCommandProcessor:
    def __init__(self, model_name="gpt-3.5-turbo"):
        self.model_name = model_name

    def process_command(self, command_text: str) -> Dict:
        """
        Process a natural language command and return an action sequence
        """
        prompt = f"""
        You are a robot command interpreter. Convert the following natural language command
        into a structured action sequence for a humanoid robot.

        Command: "{command_text}"

        Return a JSON object with:
        - intent: The main goal of the command
        - entities: Identified objects, locations, and parameters
        - action_sequence: List of actions to perform in order
        - priority: Overall priority of the task
        """

        response = openai.ChatCompletion.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )

        return eval(response.choices[0].message.content)

# Example usage
processor = LLMCommandProcessor()
result = processor.process_command("Go to the kitchen and bring me a red cup")
print(result)
```

## Intent Detection and Entity Extraction

Intent detection and entity extraction are critical for understanding what the user wants the robot to do.

### Intent Detection

Intent detection identifies the main goal or purpose of a command:

- **Navigation**: Move to a specific location
- **Object Manipulation**: Pick up, place, or manipulate objects
- **Interaction**: Interact with people or environment
- **Monitoring**: Observe or report on environment state

### Entity Extraction

Entity extraction identifies specific objects, locations, and parameters:

- **Objects**: What to interact with (cups, balls, chairs)
- **Locations**: Where to go or place things (kitchen, table, shelf)
- **Attributes**: Descriptive properties (red cup, heavy box)
- **Parameters**: Quantitative values (distance, time, speed)

### Named Entity Recognition (NER)

```python
# Example of entity extraction
def extract_entities(command_text: str) -> Dict:
    """
    Extract entities from a command using pattern matching and NER
    """
    entities = {
        "objects": [],
        "locations": [],
        "attributes": [],
        "quantities": []
    }

    # Simple pattern matching approach
    location_keywords = ["kitchen", "living room", "bedroom", "office", "bathroom"]
    object_keywords = ["cup", "ball", "book", "box", "chair", "table"]
    color_keywords = ["red", "blue", "green", "yellow", "white", "black"]

    words = command_text.lower().split()

    for word in words:
        if word in location_keywords:
            entities["locations"].append(word)
        elif word in object_keywords:
            entities["objects"].append(word)
        elif word in color_keywords:
            entities["attributes"].append(word)

    return entities
```

## Natural Language Command Schema

Based on the VLA system contracts, the natural language command schema includes the following structure:

```json
{
  "input_text": "Natural language command from user",
  "intent": "Detected intent from the command",
  "entities": [
    {
      "type": "Type of entity (object, location, action, etc.)",
      "value": "Value of the entity"
    }
  ],
  "action_sequence": [
    {
      "action_type": "Type of action to perform",
      "parameters": "Parameters for the action",
      "priority": "Priority level of the action"
    }
  ]
}
```

### Processing the Schema

When implementing language-to-plan processing, ensure that:

- Input text is properly parsed and understood
- Intent detection is accurate and contextually appropriate
- Entity extraction identifies all relevant objects and parameters
- Action sequences are logical and executable
- Priorities are assigned appropriately

## Action Sequence Generation

Generating action sequences involves creating a step-by-step plan to achieve the user's goal.

### Planning Approaches

1. **Hierarchical Task Networks (HTN)**: Break complex tasks into subtasks
2. **STRIPS Planning**: Use state representations and operators
3. **Reactive Planning**: Respond to environment changes
4. **Learning-based Planning**: Use trained models to generate plans

### Example Action Sequence

**Input Command**: "Go to the kitchen and bring me a red cup"

**Generated Action Sequence**:
1. Navigate to kitchen
2. Detect red cup in environment
3. Plan path to red cup
4. Approach red cup
5. Grasp red cup
6. Navigate back to user
7. Release cup to user

### Planning Considerations

- **Feasibility**: Ensure each action is possible given robot capabilities
- **Safety**: Avoid collisions and dangerous situations
- **Efficiency**: Optimize for time and energy
- **Robustness**: Handle unexpected situations

## Cognitive Planning Concepts

Cognitive planning in robotics involves higher-level reasoning and decision-making capabilities.

### Key Concepts

- **Goal Representation**: How to represent and maintain goals
- **World Modeling**: Maintaining an internal representation of the world
- **Reasoning**: Using logical inference to make decisions
- **Memory**: Remembering past actions and their outcomes
- **Learning**: Improving performance over time

### Planning Strategies

1. **Symbolic Planning**: Use symbolic representations of the world
2. **Geometric Planning**: Use geometric models for navigation
3. **Probabilistic Planning**: Account for uncertainty in the environment
4. **Multi-agent Planning**: Coordinate with other agents or humans

## Practical Examples

### Example 1: Simple Command Processing

**Input**: "Move forward"

**Processing**:
- Intent: Navigation
- Entities: None
- Action: Move forward (distance: 1 meter)

### Example 2: Complex Multi-step Command

**Input**: "Go to the kitchen, find the red cup, and bring it to me"

**Processing**:
- Intent: Retrieve object
- Entities:
  - Location: kitchen
  - Object: cup
  - Attribute: red
- Action Sequence:
  1. Navigate to kitchen
  2. Detect red cup
  3. Approach red cup
  4. Grasp red cup
  5. Navigate to user
  6. Release cup

### Example 3: Conditional Command

**Input**: "If the door is open, go through it; otherwise, wait"

**Processing**:
- Intent: Conditional navigation
- Entities: door
- Action Sequence:
  1. Sense door state
  2. If door open: navigate through door
  3. If door closed: wait for door to open

## Exercises

1. Implement an intent detection system for common robot commands
2. Create an entity extraction system that identifies objects and locations
3. Build a simple action planner that generates sequences for complex commands
4. Test your system with various natural language commands and evaluate performance
5. Implement error handling for ambiguous or impossible commands

## Summary

This chapter covered the language-to-plan aspect of VLA systems, focusing on how LLMs can generate complex action sequences from natural language commands. You learned about intent detection, entity extraction, and cognitive planning concepts. The previous chapter covered [Chapter 1: Voice-to-Action](./chapter-1-voice-to-action.md), and the next chapter, [Chapter 3: Capstone Project](./chapter-3-capstone-project.md), will integrate all components into a complete autonomous humanoid system.

## Assessment Questions

Test your understanding of language-to-plan concepts:

1. How do LLMs process natural language commands to generate action sequences?
2. What is the difference between intent detection and entity extraction?
3. Explain the components of the natural language command schema.
4. What are the key considerations when generating action sequences?
5. How would you handle ambiguous or complex commands in your system?

## Next Steps

Continue to [Chapter 3: Capstone Project](./chapter-3-capstone-project.md) to integrate all VLA components into a complete autonomous system.