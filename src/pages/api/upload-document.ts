import type {NextApiRequest, NextApiResponse} from 'next';
import {Pinecone} from '@pinecone-database/pinecone';
import {Document} from 'langchain/document';
import {insertDocument} from '../../ai-util';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    success: boolean;
  }>,
) {
  const {name, text} = JSON.parse(req.body);

  const doc = new Document({
    pageContent: text,
    metadata: {documentName: name},
  });

  const client = new Pinecone();
  const index = client.Index(process.env.PINECONE_INDEX_NAME || '');

  try {
    await insertDocument(index, doc);
    res.json({success: true});
  } catch (e) {
    res.json({success: false});
  }
}
export default handler;
