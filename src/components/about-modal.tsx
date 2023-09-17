import {Modal, ModalHeader, ModalBody} from 'baseui/modal';
import {useStyletron} from 'baseui';
import {ParagraphMedium} from 'baseui/typography';
import {StyledLink} from 'baseui/link';

export const AboutModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [, theme] = useStyletron();
  const handleClose = () => {
    setIsOpen(false);
  };
  return (
    <Modal onClose={handleClose} closeable isOpen={isOpen} animate autoFocus>
      <ModalHeader>Semantic search: OpenAI + NextJS sample</ModalHeader>
      <ModalBody>
        <ParagraphMedium color={theme.colors.contentSecondary}>
          This is a sample application to demonstrate semantic search with
          OpenAI Embeddings, LangChain, Pinecone vector database, and NextJS.
        </ParagraphMedium>
        <ParagraphMedium color={theme.colors.contentSecondary}>
          To get started, click the &quot;Upload Document&quot; button to upload
          a document. Once the document is uploaded, you can begin chatting with
          it.
        </ParagraphMedium>
        <ParagraphMedium color={theme.colors.contentSecondary}>
          <StyledLink
            animateUnderline
            href="https://github.com/dbabbs/semantic-search-openai-nextjs-sample"
            target="_blank"
          >
            Learn how this project was built
          </StyledLink>
          .
        </ParagraphMedium>
        <ParagraphMedium color={theme.colors.contentSecondary}>
          Made by{' '}
          <StyledLink
            animateUnderline
            href="https://twitter.com/dbabbs"
            target="_blank"
          >
            Dylan Babbs
          </StyledLink>
          .
        </ParagraphMedium>
      </ModalBody>
    </Modal>
  );
};
