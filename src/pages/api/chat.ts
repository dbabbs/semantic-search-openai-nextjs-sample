import type {NextApiRequest, NextApiResponse} from 'next';
import {Pinecone} from '@pinecone-database/pinecone';
import {queryPinecone, queryLLM, LLMResponse} from '../../ai-util';

async function handler(req: NextApiRequest, res: NextApiResponse<LLMResponse>) {
  const {documentName, question} = JSON.parse(req.body);

  const client = new Pinecone();
  const index = client.Index(process.env.PINECONE_INDEX_NAME || '');

  const queryResponse = await queryPinecone(index, question, documentName);

  if (queryResponse.matches.length > 0) {
    const result = await queryLLM(queryResponse, question);
    if (result.result.trim() === `I don't know.`) {
      res.json({
        ...result,
        sources: [],
      });
    } else {
      res.json(result);
    }
  } else {
    res.json({
      result: "Sorry, I don't know the answer to that question.",
      sources: [],
    });
  }
}
export default handler;
