# Custom Document Semantic Search with OpenAI, Pinecone, LangChain, NextJS (Sample app)

This repository is a sample application and guided walkthrough for a [semantic search](https://txt.cohere.com/what-is-semantic-search/) question-and-answer style interaction with custom user-uploaded documents.
Users can upload a custom plain text document (`.txt` file) and ask the AI questions about the content.

This project is tailored for web developers who are looking to learn more about integrating LLMs and vector databases into their projects.

[**View the live demo**](https://semantic-search-openai-nextjs-sample.vercel.app)

[**This guide is also available as a Medium article**](https://medium.com/@dbabbs/guide-create-a-full-stack-semantic-search-web-app-with-custom-documents-edeae2b35b3c)

![demo](./img/demo.gif)

**Why create a custom semantic search application?**

While [ChatGPT](https://chat.openai.com/) can handle questions about documents, it does have certain limitations:

- ChatGPT has a token limit and cannot answer questions about a document that exceeds the maximum length of a ChatGPT query.
- ChatGPT does not have knowledge about non-public documents (eg: creating a search application for your organization's internal knowledge base).

By [Dylan Babbs](https://twitter.com/dbabbs), built with guidance from Nader Dabit's [AI Semantic Search YouTube video](https://www.youtube.com/watch?v=6_mfYPPcZ60).

## How it works

1. User clicks on the **Upload Document** button on the top right on the application.
2. User uploads a custom plain text file to the backend.
3. The backend reads the file, splits the text into chunks, creates OpenAI vector embeddings, and inserts the vector embeddings into the Pinecone database.
4. In the chat window, the user can now ask any question about the document to the AI.
5. When a question is asked, OpenAI creates a query embedding based on a question, Pinecone looks for matching vectors in the database, and the OpenAI LLM answers the questions.
6. The answer to the question is displayed in the chat window and the matching text in the document is highlighted in the left-hand panel.

## Technology overview

- [OpenAI](https://platform.openai.com/): language model for interacting with the document
- [Langchain](https://js.langchain.com/docs/get_started/introduction): tools and utility functions for working with LLMs
- [Pinecone](https://www.pinecone.io/): vector database to store document vectors
- [NextJS](https://nextjs.org/): front end framework for creating the application
- [Baseweb](https://baseweb.design/): react UI components
- [Typescript](https://typescriptlang.org/): strongly typed JavaScript language

## Quick start & installation

1. Clone the repo
2. Create an `.env` file with the following environment variables

```
OPENAI_API_KEY=XXXXXXXXXXXXXX
PINECONE_API_KEY=XXXXXXXXXXXXXX
PINECONE_ENVIRONMENT=XXXXXXXXXXXXXX
PINECONE_INDEX_NAME=XXXXXXXXXXXXXX
```

3. Install the dependencies and start a local server:

```
yarn
yarn dev
```

## Guide

This is a high-level guide and walkthrough to creating the full-stack application. The full application code is available for reference in this repository.

### Step 1: Create a Pinecone vector database

Head to [Pinecone](https://www.pinecone.io/), sign up for an account, and create an index. Pinecone is a fully managed and hosted vector database that runs in the cloud. With Pinecone, there's no need to setup or configure a local database.

![pinecone-dashboard](./img/pinecone-dashboard.png)

The name that you give the database will be the same value you use as an environment variable in the `.env` file (`PINECONE_INDEX_NAME`).

For the Dimensions field, enter `1536`. [Why 1536 dimensions?](https://github.com/langchain-ai/langchain/discussions/9124)

> In the LangChain framework, when creating a new Pinecone index, the default dimension is set to 1536 to match the OpenAI embedding model text-embedding-ada-002 which uses 1536 dimensions.

For the metric field, select `cosine`.

Then, click **Create Index**. The new index will be created in a few minutes. You'll need to have the vector database created before we move onto the next steps.

Don't forget to also update the environment variables with the Pinecone details (`PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, `PINECONE_INDEX_NAME`).

### Step 2: Start building out the web application & UI

For the application's UI, we'll be using [NextJS](https://nextjs.org/) (a React framework) and Uber's [Baseweb](https://baseweb.design/) for the UI components.

When cloning the repo, you'll see we are using the following file structure. (_The repo has additional files, but this diagram only shows those that are relevant._)

```
src/
├─ components/
│  ├─ chat-view.tsx
│  ├─ document-upload-modal.tsx
|  ├─ header.tsx
├─ pages/
│  ├─ api/
│  |   ├─ chat.ts
│  |   ├─ upload-document.ts
│  ├─ index.ts
├─ ai-utils.ts
```

The files within the [`src/components/`](./src/components/) directory are UI components:

1. the chat component which will display chats between the AI and the user.
2. the document upload modal, which provides the interface for the user to upload a custom txt file.

The file [`index.tsx`](./src/pages/index.tsx) within the [`src/pages/`](./src/pages/api) directory is the main front-end file, which will be rendering the application. Here, we'll be placing most of the application's front-end logic and data fetching.

The files within the [`src/pages/api/`](./src/pages/api/) directory are the [NextJS API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes). These files are the functions which will run on the backend, such as the query to the LLM and the logic for uploading files and upserting them to the Pinecone database.

### Step 3: Enable users to upload a custom document

**Document upload modal**

In order to search a custom document, we'll need to make it easy for the user to upload a document to the application.

Inside on the [`src/pages/index.tsx`](./src/pages/index.tsx) file, we've added the following `DocumentUploadModal` component:

```tsx
// src/components/document-view.tsx
<DocumentUploadModal
  isOpen={uploadModalIsOpen}
  setIsOpen={setUploadModalIsOpen}
  setActiveDocument={setActiveDocument}
/>
```

This code for this component lives inside the [`src/components/document-upload-modal.tsx`](./src/components/document-upload-modal.tsx) file. This front-end component will:

- provide a drag and drop interface for selecting files from the user's computer
- read the contents of the file
- provide an input field for naming the file
- create a network request to send the file to the backend

**Sending the file on the front-end and handling it file on the backend**

Once the user has selected the file and clicks the **Upload** button, we'll send it to the backend with a `fetch` request:

```tsx
// src/components/document-upload-modal.tsx
// `handleSubmit` is called when the user clicks the upload button.
const handleSubmit = useCallback(async () => {
  setIsLoading(true);
  //Read contents of file
  const text = await readText(document);
  //Send file to backend
  const response = await fetch('/api/upload-document', {
    method: 'POST',
    body: JSON.stringify({
      text,
      name: documentName,
    }),
  });
  const json = await response.json();
}, [document, documentName, setActiveDocument]);
```

On the backend, we'll receive this request in the file [`src/pages/api/upload-document.ts`](./src/pages/api/upload-document.ts). This API route will:

- create a LangChain specific [`Document`](https://js.langchain.com/docs/api/document/) object with the document's content (`pageContent`) and the name of the document as metadata
- Insert the document into the Pinecone database (more on this shortly)
- Send back a response to the front-end that the document has been successfully loaded.

```ts
// src/pages/api/upload-document.ts
import {insertDocument} from '../../ai-util';
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {name, text} = JSON.parse(req.body);

  const doc = new Document({
    pageContent: text,
    metadata: {documentName: name},
  });

  const client = new Pinecone();
  const index = client.Index(process.env.PINECONE_INDEX_NAME || '');

  await insertDocument(index, doc);
  res.json({success: true});
}
export default handler;
```

### Step 4: Splitting text into chunks, creating embeddings, and upserting into Pinecone database

Let's dive into the `insertDocument` function that's inside the [`src/ai-utils.ts`](./src/ai-util.ts) file.

The first thing we'll do is start splitting the text content into chunks. [Chunking](https://www.pinecone.io/learn/chunking-strategies/) is the process of splitting large pieces of text into smaller groups. Through chunking, we can ensure we are splitting the larger content into semantically relevant smaller groups. This will help the LLM better understand the input data.

We can use the popular LangChain [`RecursiveCharacterTextSplitter`](https://js.langchain.com/docs/api/text_splitter/classes/RecursiveCharacterTextSplitter) method to create the chunks.

```ts
// src/ai-utils.ts
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
});

const chunks = await textSplitter.createDocuments([text]);
```

There are a few strategies for [choosing chunk size](https://www.pinecone.io/learn/chunking-strategies/). We are using a larger chunk size number (1000) to retain additional context in each chunk. On the other hand, choosing a smaller chunk size number will capture granular semantic information.

Next, we'll create the [OpenAI vector embeddings](https://platform.openai.com/docs/guides/embeddings/embeddings) for the document. Embeddings measure the relatedness of text strings. Embeddings can be used for search (our case). The distance between two vectors measures their relatedness.

Langchain includes a helper function for us to work with the OpenAI Embeddings API. We'll pass the chunks to the function:

```ts
// src/ai-utils.ts
const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
  chunks.map((chunk) => chunk.pageContent.replace(/\n/g, ' ')),
);
```

One we have access to the embeddings, we can begin to upsert the vectors into the Pinecone database:

```ts
// src/ai-utils.ts
const batch = [];
for (let i = 0; i < chunks.length; i++) {
  const chunk = chunks[i];
  const vector = {
    id: `${documentName}_${i}`,
    values: embeddingsArrays[i],
    metadata: {
      ...chunk.metadata,
      loc: JSON.stringify(chunk.metadata.loc),
      pageContent: chunk.pageContent,
      documentName: documentName,
    },
  };
  batch.push(vector);
}
await index.upsert(batch);
```

The vectors have now been inserted into Pinecone! You can verify they have been uploaded successfully by checking out the index details in the Pinecone web application. You'll be able to see some items under the "Browser" tab:

![Pinecone vectors successfully inserted](./img/pinecone-vectors-inserted.png)

### Step 5: Tasking the LLM to answer the query

Now, let's configure the logic of handling the question and answering within the custom document. To facilitate this, we're going to create a new API endpoint to handle this request: [`src/pages/api/chat.ts`](./src/pages/api/chat.ts)

```ts
// src/pages/api/chat.ts
async function handler(req: NextApiRequest, res: NextApiResponse<LLMResponse>) {
  const {documentName, question} = JSON.parse(req.body);
  const client = new Pinecone();
  const index = client.Index(process.env.PINECONE_INDEX_NAME || '');

  //Query Pinecone client
  const queryResponse = await queryPinecone(index, question, documentName);

  if (queryResponse.matches.length > 0) {
    //Query LLM
    const result = await queryLLM(queryResponse, question);
    res.json(result);
  } else {
    res.json({
      result: "Sorry, I don't know the answer to that question.",
      sources: [],
    });
  }
}
export default handler;
```

When we receive the request, we'll want to:

- query the Pinecone database for top matches of the query
- query the LLM to answer the question based off the custom document we've provided it

**Query the Pinecone database**

We'll look at the function `queryPinecone` in file [`src/ai-utils.ts`](./src/ai-util.ts). Here we'll query the Pinecone database for the relevant text content.

```ts
// src/pages/api/chat.ts
export async function queryPinecone(
  index,
  question: string,
  documentName: string,
) {
  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);

  let queryResponse = await index.query({
    topK: 10,
    vector: queryEmbedding,
    includeMetadata: true,
    includeValues: true,
    filter: {documentName: {$eq: documentName}},
  });

  return queryResponse;
}
```

We also pass in an extra `filter` object to ensure we are only querying documents in the database that match the same `documentName` as the current document we are viewing. This is because this project's Pinecone database is storing multiple unrelated documents.

**Query the LLM**

If the Pinecone query response returns an array of values, that means we have some matches in the document. At this point, we'll want to query the LLM. We'll do so in the function `queryLLM` in the [`src/ai-utils.ts`](./src/ai-util.ts) file.

First, we will initialize the OpenAI LLM with a temperature of `0.3`. [Temperature](https://platform.openai.com/docs/api-reference) in OpenAI is the parameter that affects the randomness of the output. A higher temperature number is useful for creative output, such as writing a novel. Since we are creating an application to answer direct questions about provided information, we want reliable output, so we'll set the temperature to a lower number (`0.3`).

```ts
// src/pages/api/chat.ts
const llm = new OpenAI({
  temperature: 0.3,
});
const chain = loadQAStuffChain(llm);
```

Next, we'll combine the content of the matching information from the Pinecone query into a single string that we can pass into the LLM. At this point, we've found the relevant information in the document about the question and passed it into the LLM. It's similar to identifying a targeted short piece of text and copying and pasting it directly into ChatGPT with the question.

```ts
// src/pages/api/chat.ts
const concatenatedPageContent = queryResponse.matches
  .map((match: any) => match.metadata.pageContent)
  .join('');
```

Finally, we'll execute the OpenAI LLM query:

```ts
// src/pages/api/chat.ts
const result = await chain.call({
  input_documents: [new Document({pageContent: concatenatedPageContent})],
  question: question,
});

return {
  result: result.text,
  sources: queryResponse.matches.map((x) => ({
    pageContent: x.metadata.pageContent,
    score: x.score,
  })),
};
```

This function will return:

- `result`: the string of the answer of question that we'll be displaying as the response in the chatbot.
- `sources`: an array of sources, which contain information about the matching text the response is based upon. This information is used to identify the text to highlight in the UI that displays the original document content.

With this logic so far, we've calculated the answer to the query and we can send the response back to the client to display in the UI.

### Step 6: Complete the front-end

All of the backend logic is now complete and we can begin building the chat interaction UI on the front-end.

**Data fetching to the backend**

Inside of [`src/pages/index.tsx`](./src/pages/index.tsx), let's examine the function `sendQuery`, where we implement the data fetching to the backend service we created in Step #5.

Everytime the user clicks the **Send** button, we'll execute the function, which will pass the query (the question) and the document name to the backend.

```tsx
// src/pages/index.tsx
const sendQuery = useCallback(async () => {
  //Update messages state to show user's question in the chat bubble
  setMessages((prev) => [...prev, {role: 'user', content: input}]);

  //Data request
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      question: input,
      documentName: activeDocument.name,
    }),
  });
  const json = await response.json();

  //Update messages state to include AI's response
  setMessages((prev) => [...prev, {role: 'assistant', content: json.result}]);

  if (json.sources.length > 0) {
    //Update highlight text state to show sources in original document
    setHighlightedText(json.sources[0].pageContent);
  }
}, [input, activeDocument]);
```

When we receive a response from the backend with the answer to the question, we will:

- update the messages object state to show the response to the question in the chat UI
- update the active highlighted text state, which tells the UI which text in the document viewer to highlight

**Create the chat interface**

We have the logic that requests a new response to the query every time the user types in a question, now let's feed the data into an interactive chat interface.

Inside of [`src/pages/index.tsx`](./src/pages/index.tsx), we'll render a `ChatView` component:

```jsx
// src/pages/index.tsx
<ChatView
  messages={messages}
  input={input}
  setInput={setInput}
  sendQuery={sendQuery}
  activeDocument={activeDocument}
/>
```

The code for this component will live in a separate file: [`src/components/chat-view.tsx`](./src/components/chat-view.tsx). We won't dive into the details of this specific component, but it provides the components and layouts for:

- displaying chat messages from the AI assistant (server) and user
- handling input field state
- automatically scrolling the window to show the most recent chat messages at the bottom of the page.

**Document viewer and highlighting relevant text**

In order to make the application's UI as useful as possible, we'll also want to also show a copy of the document on the left side of the window. This way, the user can see the document and the chat open side-by-side. We'll enable this with the `DocumentView` component inside of [`src/components/document-view.tsx`](./src/components/document-view.tsx). We'll render the component inside of of the main index page:

```jsx
// src/pages/index.tsx
<DocumentView
  activeDocument={activeDocument}
  highlightedText={highlightedText}
/>
```

Using the `highlightedText` state variable, which contains the relevant source content that the LLM's response is based upon, we can also highlight the relevant info in the original document. This is helpful because the user can see the source of the LLM's chat response directly in the application's UI.

The highlighted text is implemented by searching for the matching string within the original text content, and then wrapping the specific text with an inline style (`<span />`).

```tsx
// src/components/document-view.tsx
const Highlight = styled('span', ({$theme}) => ({
  backgroundColor: $theme.colors.backgroundWarning,
  padding: '1px',
}));

<Highlight ref={highlightRef}>{highlightedText}</Highlight>;
```

The component also provides a listener which will scroll the relevant position within the document view in which the highlighted text is located.

![highlighted text](./img/text-highlight.png)

### Finish

You now have a functioning full stack chat application in which users can:

- upload a custom document
- ask questions about the document's content using an OpenAI LLM
- view the highlighted source content of the LLM's response in a document view panel
