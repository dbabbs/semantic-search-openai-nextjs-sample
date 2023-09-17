import {styled, useStyletron} from 'baseui';
import {ParagraphSmall} from 'baseui/typography';
import {Input} from 'baseui/input';
import {Button} from 'baseui/button';
import {Skeleton} from 'baseui/skeleton';
import {ReactNode, useEffect, useRef} from 'react';
import {Document, Message} from '../pages';

const Container = styled('div', ({$theme}) => ({
  background: $theme.colors.backgroundPrimary,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
}));

const MessagesContainer = styled('div', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  overflowY: 'auto',
  padding: '16px',
});

const InputContainer = styled('div', ({$theme}) => ({
  display: 'flex',
  gap: '16px',
  borderTop: `1px solid ${$theme.colors.borderOpaque}`,
  paddingTop: '16px',
  padding: '16px',
}));

const Message = ({
  children,
  role,
  isLoading,
}: {
  children: ReactNode;
  role: string;
  isLoading: boolean;
}) => {
  const [css, theme] = useStyletron();
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '0px',
        alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
        alignItems: role === 'user' ? 'flex-end' : 'flex-start',
        background: theme.colors.backgroundSecondary,
        borderRadius: '8px',
        padding: '8px 12px',
      })}
    >
      <ParagraphSmall margin="0" color={theme.colors.contentTertiary}>
        {role === 'user' ? 'User:' : 'Document AI:'}
      </ParagraphSmall>
      {isLoading ? (
        <Skeleton width="300px" height="20px" animation />
      ) : (
        <ParagraphSmall margin="0">{children}</ParagraphSmall>
      )}
    </div>
  );
};
export const ChatView = ({
  messages,
  input,
  setInput,
  sendQuery,
  activeDocument,
}: {
  messages: Message[];
  input: string;
  setInput: (text: string) => void;
  sendQuery: () => void;
  activeDocument: Document;
}) => {
  const ref = useRef<HTMLDivElement | undefined>();

  useEffect(() => {
    //Ensure the most recent messages are visible
    if (ref.current) {
      // @ts-ignore
      ref.current.scrollTo(0, ref.current.offsetHeight);
    }
  }, [messages]);

  return (
    <Container>
      <MessagesContainer ref={ref}>
        {messages.map(({role, content, isLoading}, index) => {
          return (
            <Message
              key={`message-${role}-${index}`}
              role={role}
              isLoading={isLoading || false}
            >
              {content}
            </Message>
          );
        })}
      </MessagesContainer>

      <InputContainer>
        <Input
          value={input}
          placeholder="Ask a question about the document..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(evt) => {
            if (evt.key === 'Enter') {
              sendQuery();
            }
          }}
          disabled={!activeDocument}
        />
        <Button type="submit" onClick={sendQuery} disabled={!activeDocument}>
          Send
        </Button>
      </InputContainer>
    </Container>
  );
};
