import {useState, useCallback} from 'react';
import {Modal, ModalHeader, ModalBody} from 'baseui/modal';
import {FileUploader} from 'baseui/file-uploader';
import {Input} from 'baseui/input';
import {Button, SIZE} from 'baseui/button';
import {LabelSmall} from 'baseui/typography';
import {styled, useStyletron} from 'baseui';

const acceptedFiles = ['.txt'];

const FlexColumn = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

const readText = async (document: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      // @ts-ignore
      resolve(event.target.result as string);
    };
    reader.readAsText(document);
  });
};

export const DocumentUploadModal = ({
  isOpen,
  setIsOpen,
  setActiveDocument,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setActiveDocument: (document: {text: string; name: string}) => void;
}) => {
  const [, theme] = useStyletron();
  const [document, setDocument] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    const text = await readText(document);
    const response = await fetch('/api/upload-document', {
      method: 'POST',
      body: JSON.stringify({
        text,
        name: documentName,
      }),
    });
    const json = await response.json();

    if (json.success) {
      setActiveDocument({text, name: documentName});
      setIsLoading(false);
      setIsOpen(false);
      setDocument(null);
      setDocument(false);
    }
  }, [document, documentName, setActiveDocument, setIsOpen]);

  return (
    <Modal closeable isOpen={isOpen} animate autoFocus>
      <ModalHeader>Upload Document</ModalHeader>
      <ModalBody>
        <FlexColumn>
          {document ? (
            <>
              <LabelSmall>Document name</LabelSmall>
              <Input
                size={SIZE.compact}
                placeholder="Document name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
              <Button
                size={SIZE.compact}
                isLoading={isLoading}
                onClick={handleSubmit}
              >
                Upload
              </Button>
            </>
          ) : (
            <>
              <FileUploader
                accept={acceptedFiles.join(',')}
                onDrop={async (acceptedFiles) => {
                  setDocumentName(acceptedFiles[0].name);
                  setDocument(acceptedFiles[0]);
                }}
              />
              <LabelSmall color={theme.colors.contentSecondary}>
                {acceptedFiles.join(', ')} files accepted
              </LabelSmall>
            </>
          )}
        </FlexColumn>
      </ModalBody>
    </Modal>
  );
};
