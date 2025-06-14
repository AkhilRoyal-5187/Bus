import { NextRequest, NextResponse } from 'next/server';
import { initializeVectorStore, initializeChatModel, createRagChain } from '@/lib/langchain';

let ragChain: ((query: string) => Promise<string>) | null = null;

export async function POST(request: NextRequest) {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    console.log("Chat API: Received request.");

    if (!process.env.OPENAI_API_KEY) {
      console.error('Chat API: OpenAI API key is not configured.');
      return new NextResponse(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers }
      );
    }
    console.log("Chat API: OpenAI API key is configured.");

    const body = await request.json();
    const { message } = body;
    console.log("Chat API: Received message:", message);

    if (!message) {
      console.error('Chat API: Message is required.');
      return new NextResponse(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers }
      );
    }

    if (!ragChain) {
      try {
        console.log("Chat API: Initializing RAG chain...");
        const vectorStore = await initializeVectorStore();
        const chatModel = initializeChatModel();
        ragChain = await createRagChain(vectorStore, chatModel);
        console.log("Chat API: RAG chain initialized successfully.");
      } catch (error) {
        console.error('Chat API: Failed to initialize RAG chain:', error);
        return new NextResponse(
          JSON.stringify({ error: 'Failed to initialize chat system' }),
          { status: 500, headers }
        );
      }
    }

    console.log("Chat API: Invoking RAG chain with message:", message);
    // Add the non-null assertion operator (!) here
    const response = await ragChain!(message);
    console.log("Chat API: RAG chain responded:", response);

    return new NextResponse(
      JSON.stringify({ response }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Chat API Error (caught in POST handler):', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return new NextResponse(
      JSON.stringify({ error: 'Failed to process chat message' }),
      { status: 500, headers }
    );
  }
}