import {styled, useStyletron} from 'baseui';
import {ParagraphSmall} from 'baseui/typography';
import {NAV_HEIGHT, type Document} from '../pages';
import {useEffect, useRef} from 'react';

const Container = styled('div', ({$theme}) => ({
  background: $theme.colors.backgroundPrimary,
  padding: '0 16px',
  overflow: 'auto',
}));

const Highlight = styled('span', ({$theme}) => ({
  backgroundColor: $theme.colors.backgroundWarning,
  padding: '1px',
}));

const EmptyState = () => {
  const [, theme] = useStyletron();
  return (
    <Container
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ParagraphSmall color={theme.colors.contentTertiary}>
        To get started, click the &quot;Upload Document&quot; button in the top
        right.
      </ParagraphSmall>
    </Container>
  );
};

export const DocumentView = ({
  activeDocument,
  highlightedText,
}: {
  activeDocument: Document;
  highlightedText: string | null;
}) => {
  const [, theme] = useStyletron();

  const highlightRef = useRef();
  const containerRef = useRef();
  const prevHighlightedText = useRef(highlightedText);

  useEffect(() => {
    if (
      highlightRef.current &&
      containerRef.current &&
      highlightedText !== prevHighlightedText.current
    ) {
      const top = (highlightRef.current as HTMLDivElement).offsetTop;
      (containerRef.current as HTMLDivElement).scrollTo({
        //Add some padding to the scroll
        top: top - NAV_HEIGHT - 8,
        behavior: 'smooth',
      });
      prevHighlightedText.current = highlightedText;
    }
  }, [highlightRef, highlightedText]);

  if (!activeDocument) {
    return <EmptyState />;
  }

  const paragraphs: any[] = activeDocument.text.split('\n');
  if (highlightedText) {
    highlightedText = highlightedText.trim();
    const matchIndex = paragraphs.findIndex((x) => x.includes(highlightedText));
    console.log(matchIndex);
    console.log(highlightedText);
    console.log(activeDocument.text);

    if (matchIndex !== -1) {
      const split = paragraphs[matchIndex].split(highlightedText);
      console.log(split);
      paragraphs[matchIndex] = (
        <>
          {split[0]}
          <Highlight ref={highlightRef}>{highlightedText}</Highlight>
          {split[1]}
        </>
      );
    }
  }

  return (
    <Container ref={containerRef}>
      {paragraphs.map((paragraph, index) => {
        return (
          <ParagraphSmall
            color={theme.colors.contentSecondary}
            key={`paragraph-${index}`}
          >
            {paragraph}
          </ParagraphSmall>
        );
      })}
    </Container>
  );
};
