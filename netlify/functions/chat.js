// netlify/functions/chat.js
// This handles secure communication with OpenAI

const ASSISTANT_ID = 'asst_JZcfXBgOzjBNGvk1lxjo7GpH';

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, threadId } = JSON.parse(event.body);

    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let currentThreadId = threadId;

    // Create a new thread if we don't have one
    if (!currentThreadId) {
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!threadResponse.ok) {
        throw new Error('Failed to create thread');
      }

      const threadData = await threadResponse.json();
      currentThreadId = threadData.id;
    }

    // Add the user's message to the thread
    await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: message
      })
    });

    // Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID
      })
    });

    if (!runResponse.ok) {
      throw new Error('Failed to run assistant');
    }

    const runData = await runResponse.json();
    const runId = runData.id;

    // Poll for completion
    let runStatus = 'queued';
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max

    while (runStatus !== 'completed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const statusResponse = await fetch(
        `https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );

      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      attempts++;

      if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
        throw new Error(`Run ${runStatus}`);
      }
    }

    if (runStatus !== 'completed') {
      throw new Error('Assistant response timeout');
    }

    // Get the assistant's response
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${currentThreadId}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      }
    );

    const messagesData = await messagesResponse.json();
    const assistantMessage = messagesData.data[0];
    const responseText = assistantMessage.content[0].text.value;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        response: responseText,
        threadId: currentThreadId
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process message',
        details: error.message 
      })
    };
  }
};