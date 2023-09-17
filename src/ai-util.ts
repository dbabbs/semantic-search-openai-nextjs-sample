import {OpenAIEmbeddings} from 'langchain/embeddings/openai';
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter';
import {OpenAI} from 'langchain/llms/openai';
import {loadQAStuffChain} from 'langchain/chains';
import {Document} from 'langchain/document';
import type {Pinecone, QueryResponse} from '@pinecone-database/pinecone';

export const insertDocument = async (index, doc: Document) => {
  const text = doc.pageContent;
  const documentName = doc.metadata.documentName;

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });

  const chunks = await textSplitter.createDocuments([text]);

  const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
    chunks.map((chunk) => chunk.pageContent.replace(/\n/g, ' ')),
  );

  const batchSize = 100;
  let batch: any = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const vector = {
      id: `${documentName}_${i}`,
      values: embeddingsArrays[i],
      metadata: {
        ...chunk.metadata,
        loc: JSON.stringify(chunk.metadata.loc),
        pageContent: chunk.pageContent,
        documentName,
      },
    };
    batch.push(vector);

    console.log(`vector ${i} of ${chunks.length} chunks`);

    if (batch.length === batchSize || i === chunks.length - 1) {
      await index.upsert(batch);

      batch = [];
    }
  }
};

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

type Source = {
  pageContent: string;
  score: number;
};
export type LLMResponse = {
  result: string;
  sources: Source[];
};

export async function queryLLM(
  queryResponse: QueryResponse,
  question: string,
): Promise<LLMResponse> {
  const llm = new OpenAI({
    temperature: 0.3,
  });
  const chain = loadQAStuffChain(llm);

  const concatenatedPageContent = queryResponse.matches
    .map((match: any) => match.metadata.pageContent)
    .join('');

  const result = await chain.call({
    input_documents: [new Document({pageContent: concatenatedPageContent})],
    question: question,
  });

  return {
    result: result.text,
    //@ts-ignore
    sources: queryResponse.matches.map((x) => ({
      pageContent: x.metadata.pageContent,
      score: x.score,
    })),
  };
}
