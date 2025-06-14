// /home/pmakka/Desktop/BUS-Pass/Bus/Bus/src/lib/langchain.ts

import { ChatOpenAI } from "@langchain/openai";
import { Document } from "langchain/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Project documentation
const projectDocs = [
  {
    content: `The Bus Pass Management System is a comprehensive digital solution designed to streamline the process of managing bus passes for students and staff. 
    It provides a user-friendly interface for applying, renewing, and managing bus passes efficiently.`,
    metadata: { source: "project_description" }
  },
  {
    content: `Key Features:
    1. Digital Application Process
    2. Real-time Status Tracking
    3. Automated Renewal System
    4. Digital Pass Storage
    5. Admin Dashboard for Verification
    6. User Profile Management`,
    metadata: { source: "features" }
  },
  {
    content: `Benefits:
    1. Reduced Paperwork: Eliminates the need for physical documents
    2. Time Efficiency: Faster processing and approval
    3. Easy Access: Digital passes accessible anytime
    4. Environment Friendly: Reduces paper waste
    5. Better Organization: Centralized management system`,
    metadata: { source: "benefits" }
  },
  {
    content: `How it works:
    1. Users register and create an account
    2. Fill out the bus pass application form
    3. Upload required documents
    4. Submit for approval
    5. Track application status
    6. Receive digital pass upon approval
    7. Use digital pass for bus travel`,
    metadata: { source: "how_it_works" }
  }
];

// Initialize the vector store
export async function initializeVectorStore() {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await textSplitter.createDocuments(
    projectDocs.map(doc => doc.content),
    projectDocs.map(doc => doc.metadata)
  );

  const vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    })
  );

  return vectorStore;
}

// Initialize the chat model
export function initializeChatModel() {
  return new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
  });
}

// Define the type for the RAG chain function
type RagChainFunction = (query: string) => Promise<string>;

// Create a RAG chain
export async function createRagChain(
  vectorStore: MemoryVectorStore,
  chatModel: ChatOpenAI
): Promise<RagChainFunction> {
  return async (query: string): Promise<string> => {
    // Retrieve relevant documents
    const relevantDocs = await vectorStore.similaritySearch(query, 3);
    
    // Create context from relevant documents
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");
    
    // Create the prompt
    const prompt = `You are a helpful assistant for the Bus Pass Management System. 
    Use the following context to answer the user's question. If you don't know the answer, 
    say that you don't know. Don't make up information.

    Context:
    ${context}

    User Question: ${query}

    Answer:`;

    // Get response from the chat model
    const response = await chatModel.invoke(prompt);
    return response.content.toString();
  };
}