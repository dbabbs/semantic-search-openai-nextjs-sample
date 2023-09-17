import {LabelSmall} from 'baseui/typography';
import Upload from 'baseui/icon/upload';
import {Button, KIND, SIZE} from 'baseui/button';
import {styled} from 'baseui';
import type {Document} from '../pages';

const Container = styled('div', ({$theme}) => ({
  padding: '8px 16px',
  borderBottom: `1px solid ${$theme.colors.borderOpaque}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const Group = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
});

export const Header = ({
  activeDocument,
  setUploadModalIsOpen,
  setAboutModalIsOpen,
}: {
  activeDocument: Document;
  setUploadModalIsOpen: (isOpen: boolean) => void;
  setAboutModalIsOpen: (isOpen: boolean) => void;
}) => {
  return (
    <Container>
      <LabelSmall>
        Document AI{activeDocument && `: ${activeDocument.name}`}
      </LabelSmall>
      <Group>
        <Button
          size={SIZE.compact}
          kind={KIND.tertiary}
          onClick={() => setAboutModalIsOpen(true)}
        >
          About
        </Button>

        <Button
          startEnhancer={<Upload />}
          size={SIZE.compact}
          kind={KIND.secondary}
          onClick={() => setUploadModalIsOpen(true)}
        >
          Upload Document
        </Button>
      </Group>
    </Container>
  );
};
