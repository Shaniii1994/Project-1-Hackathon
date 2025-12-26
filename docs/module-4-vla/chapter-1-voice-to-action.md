# Chapter 1: Voice-to-Action

## Introduction

This chapter introduces the fundamental concepts of converting spoken commands into robot actions using speech recognition and LLM processing. Students will learn how to process voice input, convert it to text, and generate appropriate robot actions.

## Learning Objectives

By the end of this chapter, you will be able to:

- Understand the voice-to-action pipeline
- Implement speech recognition for robot commands
- Process audio input and convert to text
- Generate appropriate robot actions from voice commands
- Handle common issues in speech recognition

## Prerequisites

- Basic understanding of ROS 2 concepts
- Familiarity with audio processing concepts

## Table of Contents

1. [Voice Command Processing Overview](#voice-command-processing-overview)
2. [Speech Recognition Technology](#speech-recognition-technology)
3. [Speech-to-Text Conversion](#speech-to-text-conversion)
4. [Voice Command Schema](#voice-command-schema)
5. [Practical Examples](#practical-examples)
6. [Troubleshooting](#troubleshooting)

## Voice Command Processing Overview

The voice-to-action pipeline is the foundational capability that enables the entire VLA system. It involves several key steps:

1. **Audio Capture**: Capturing voice commands from the user
2. **Speech Recognition**: Converting audio to text
3. **Command Processing**: Interpreting the text command
4. **Action Generation**: Creating appropriate robot actions

### Key Components

- **Audio Input**: Microphone or audio stream
- **Speech-to-Text Engine**: Converts audio to text
- **Command Parser**: Interprets the text command
- **Action Generator**: Creates robot action sequences

## Speech Recognition Technology

Speech recognition technology is the process of converting spoken language into text. In the context of robotics, this enables voice commands to control robot behavior.

### Common Approaches

1. **Cloud-based APIs**: Services like Google Speech-to-Text, AWS Transcribe, or Azure Speech
2. **On-device Processing**: Libraries like CMU Sphinx, Vosk, or Whisper
3. **Hybrid Approaches**: Combining cloud and local processing

### Key Considerations

- **Accuracy**: Recognition accuracy in various environments
- **Latency**: Time to convert speech to text
- **Privacy**: Handling of audio data
- **Offline Capability**: Functionality without internet connection

## Speech-to-Text Conversion

The speech-to-text conversion process involves several steps:

### Audio Preprocessing

1. **Noise Reduction**: Removing background noise
2. **Audio Enhancement**: Improving signal quality
3. **Format Conversion**: Converting to appropriate audio format

### Recognition Process

1. **Feature Extraction**: Extracting relevant audio features
2. **Acoustic Modeling**: Mapping audio features to phonemes
3. **Language Modeling**: Converting phonemes to words
4. **Decoding**: Combining acoustic and language models

### Example Implementation

```python
# Example of speech-to-text conversion
import speech_recognition as sr

def recognize_speech_from_microphone():
    recognizer = sr.Recognizer()
    microphone = sr.Microphone()

    with microphone as source:
        recognizer.adjust_for_ambient_noise(source)
        print("Listening for command...")
        audio = recognizer.listen(source)

    try:
        command_text = recognizer.recognize_google(audio)
        print(f"Recognized: {command_text}")
        return command_text
    except sr.UnknownValueError:
        print("Could not understand audio")
        return None
    except sr.RequestError as e:
        print(f"Error with speech recognition service: {e}")
        return None
```

## Voice Command Schema

Based on the VLA system contracts, the voice command schema includes the following structure:

```json
{
  "audio_input": "Raw audio data or file reference",
  "transcript": "Text transcription of the audio",
  "confidence": "Confidence score of the transcription (0-1)",
  "timestamp": "When the command was received (ISO 8601 format)"
}
```

### Processing the Schema

When implementing voice command processing, ensure that:

- Audio input is properly captured and formatted
- Transcription is accurate and contextually appropriate
- Confidence scores are used to determine command reliability
- Timestamps are properly recorded for command ordering

## Practical Examples

### Example 1: Basic Movement Commands

**Voice Command**: "Move forward 2 meters"

**Processed Command**:
- Intent: Move forward
- Parameters: distance=2 meters
- Action: Robot moves forward by specified distance

### Example 2: Object Manipulation

**Voice Command**: "Pick up the red ball"

**Processed Command**:
- Intent: Pick up object
- Parameters: object_color=red, object_type=ball
- Action: Robot identifies and picks up the red ball

### Example 3: Complex Commands

**Voice Command**: "Go to the kitchen and bring me a cup"

**Processed Command**:
- Intent: Navigate and retrieve
- Parameters: destination=kitchen, object=cup
- Action: Robot navigates to kitchen and retrieves cup

## Troubleshooting

### Common Issues and Solutions

1. **Poor Recognition Accuracy**
   - **Cause**: Background noise, poor microphone quality
   - **Solution**: Use noise reduction, improve audio input quality

2. **High Latency**
   - **Cause**: Network delays (for cloud-based), processing overhead
   - **Solution**: Optimize network connection, consider local processing

3. **False Positives**
   - **Cause**: Ambient noise, unintended triggers
   - **Solution**: Implement wake word detection, adjust sensitivity

4. **Language Support**
   - **Cause**: Limited language models
   - **Solution**: Use multilingual models or provide language selection

## Exercises

1. Implement a basic speech-to-text system using your preferred technology
2. Create a simple command parser that converts text to robot actions
3. Test your system with various voice commands and measure accuracy
4. Implement error handling for common speech recognition failures

## Summary

This chapter covered the fundamentals of voice-to-action processing in VLA systems. You learned about speech recognition technology, the conversion process, and practical implementation approaches. The next chapter, [Chapter 2: Language-to-Plan](./chapter-2-language-to-plan.md), will build on these concepts to create more complex action sequences from natural language commands.

## Assessment Questions

Test your understanding of voice-to-action concepts:

1. What are the key components of the voice-to-action pipeline?
2. Explain the difference between cloud-based and on-device speech recognition.
3. What factors affect the accuracy of speech recognition systems?
4. How would you implement error handling for speech recognition failures?
5. Describe the voice command schema and its components.

## Next Steps

Continue to [Chapter 2: Language-to-Plan](./chapter-2-language-to-plan.md) to learn about language processing and action planning.