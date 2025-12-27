# ElevenLabs Integration Setup Guide

This guide will help you set up ElevenLabs Conversational AI for the Aira interview system.

## Prerequisites

1. **ElevenLabs Account**: Sign up at [elevenlabs.io](https://elevenlabs.io/sign-up)
2. **API Key**: Get your API key from the ElevenLabs dashboard
3. **Conversational AI Agent**: Create an agent in the ElevenLabs dashboard

## Step 1: Create ElevenLabs Account and Get API Key

1. Go to [elevenlabs.io](https://elevenlabs.io/sign-up) and create an account
2. Navigate to your profile settings
3. Generate an API key and copy it
4. Keep this key secure - you'll need it for the configuration

## Step 2: Create a Conversational AI Agent

1. Go to the [ElevenLabs Conversational AI Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Click "Create New Agent"
3. Choose "Blank Template"
4. Configure your agent:

### Basic Settings
- **Name**: "Aira Technical Interviewer"
- **Description**: "AI interviewer for technical assessments"

### Agent Configuration
- **First Message**: "Hi! I'm Aira, your AI interviewer. Welcome to the technical assessment."
- **System Prompt**: 
```
You are Aira, a friendly and professional AI interviewer for a coding assessment platform. 

Your role is to conduct technical interviews and assess candidates' programming skills, problem-solving abilities, and technical knowledge.

Guidelines:
- Be warm, encouraging, and professional
- Ask clear, specific questions about programming concepts
- Listen actively and ask follow-up questions
- Provide constructive feedback
- Keep responses concise but thorough
- Adapt your questioning based on the candidate's responses
```

### Voice Settings
- Choose a professional, clear voice from the voice library
- Recommended: Use a voice that sounds friendly but authoritative
- Test the voice to ensure it's suitable for technical interviews

### Advanced Settings
- **Language**: English
- **LLM**: Choose GPT-4o or Claude 3.5 Sonnet for best results
- **Response Length**: Medium (for balanced conversation flow)

5. Save your agent and copy the **Agent ID** from the URL or settings

## Step 3: Configure Environment Variables

1. Open the `.env` file in your project root
2. Add your ElevenLabs credentials:

```env
# ElevenLabs Configuration
VITE_ELEVENLABS_API_KEY=your_actual_api_key_here
VITE_ELEVENLABS_AGENT_ID=your_actual_agent_id_here
```

**Important**: Replace the placeholder values with your actual credentials.

## Step 4: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Navigate to the Aira interview page
3. Complete the setup stages (role selection, resume upload)
4. When you reach stage 2 (AI Assistant), the system should:
   - Request microphone permission
   - Connect to ElevenLabs
   - Display the wave animation
   - Start the conversation with your configured first message

## Features

### Real-time Voice Conversation
- **Speech-to-Text**: User speech is transcribed in real-time
- **AI Processing**: ElevenLabs processes the conversation with your chosen LLM
- **Text-to-Speech**: AI responses are converted to natural speech
- **Turn-taking**: Intelligent conversation flow management

### Stage-based Interviews
The system automatically configures different prompts for each interview stage:
- **Stage 2**: Introduction and warm-up
- **Stage 3**: Knowledge assessment
- **Stage 4**: Deep dive discussion
- **Stage 5**: Final questions
- **Stage 6**: Assessment summary

### Visual Feedback
- **Wave Animation**: Replaces static microphone icons
- **Connection Status**: Shows when connected/disconnected
- **Speaking Indicators**: Visual feedback when AI is speaking

## Troubleshooting

### Common Issues

1. **"ElevenLabs configuration is missing"**
   - Check that your `.env` file has the correct variable names
   - Ensure your API key and Agent ID are valid
   - Restart your development server after changing `.env`

2. **"Microphone access denied"**
   - Grant microphone permission in your browser
   - Check browser settings for microphone access
   - Try refreshing the page and granting permission again

3. **"Failed to start conversation"**
   - Verify your ElevenLabs agent is active
   - Check your API key permissions
   - Ensure you have sufficient ElevenLabs credits

4. **No audio output**
   - Check your system volume settings
   - Verify browser audio permissions
   - Test with different browsers

### Debug Mode

To enable debug logging, open browser developer tools and check the console for:
- Connection status messages
- ElevenLabs API responses
- Audio stream information

## Pricing Considerations

ElevenLabs Conversational AI pricing:
- **Free Tier**: 15 minutes per month
- **Starter**: $5/month for 50 minutes
- **Creator**: $22/month for 250 minutes
- **Pro**: $99/month for 1,100 minutes

For production use, consider the Business plan for higher volume and better rates.

## Security Notes

1. **API Key Security**: Never expose your API key in client-side code
2. **Environment Variables**: Use `VITE_` prefix for client-side variables
3. **Agent Authentication**: Consider enabling authentication for production agents
4. **Rate Limiting**: Monitor usage to avoid unexpected charges

## Support

For issues with:
- **ElevenLabs API**: Check [ElevenLabs Documentation](https://elevenlabs.io/docs)
- **Integration Code**: Review the implementation in `src/hooks/useElevenLabsConversation.ts`
- **Voice Quality**: Experiment with different voices and settings in the ElevenLabs dashboard

## Next Steps

Once the basic integration is working:
1. Customize the interview prompts for your specific needs
2. Add custom tools and knowledge bases to your ElevenLabs agent
3. Implement conversation analytics and feedback collection
4. Consider adding authentication for production use
